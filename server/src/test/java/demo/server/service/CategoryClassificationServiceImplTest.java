package demo.server.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import demo.server.common.enums.CategoryType;
import demo.server.entity.Category;
import demo.server.entity.MerchantMapping;
import demo.server.entity.Transaction;
import demo.server.entity.User;
import demo.server.repository.CategoryRepository;
import demo.server.repository.MerchantMappingRepository;
import demo.server.service.impl.CategoryClassificationServiceImpl;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

@ExtendWith(MockitoExtension.class)
public class CategoryClassificationServiceImplTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private MerchantMappingRepository merchantMappingRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AiCategorizerService aiCategorizerService;

    @InjectMocks
    private CategoryClassificationServiceImpl categoryClassificationService;

    private User user;
    private Category category;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@example.com").build();
        category = Category.builder().id(100L).user(user).name("Food").type(CategoryType.EXPENSE).build();
        
        transaction = Transaction.builder()
            .id(1L)
            .user(user)
            .merchantName("Starbucks")
            .note("Starbucks coffee")
            .amount(BigDecimal.valueOf(150000))
            .type(CategoryType.EXPENSE)
            .transactionDate(LocalDate.now())
            .build();
    }

    @Test
    void testClassifyTransaction_CacheHit() {
        // Arrange
        String cacheKey = "merchant:category:1:starbucks";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(cacheKey)).thenReturn("100");
        when(categoryRepository.findById(100L)).thenReturn(Optional.of(category));

        // Act
        categoryClassificationService.classifyTransaction(transaction);

        // Assert
        assertNotNull(transaction.getCategory());
        assertEquals(100L, transaction.getCategory().getId());
        assertEquals("Food", transaction.getCategory().getName());
        verify(merchantMappingRepository, never()).findByUserIdAndMerchantNameIgnoreCase(any(), any());
    }

    @Test
    void testClassifyTransaction_MerchantMappingHit() {
        // Arrange
        String cacheKey = "merchant:category:1:starbucks";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(cacheKey)).thenReturn(null);

        MerchantMapping mapping = MerchantMapping.builder()
            .user(user)
            .merchantName("Starbucks")
            .category(category)
            .build();

        when(merchantMappingRepository.findByUserIdAndMerchantNameIgnoreCase(1L, "Starbucks"))
            .thenReturn(Optional.of(mapping));

        // Act
        categoryClassificationService.classifyTransaction(transaction);

        // Assert
        assertNotNull(transaction.getCategory());
        assertEquals(100L, transaction.getCategory().getId());
        verify(valueOperations).set(eq(cacheKey), eq("100"), any(Duration.class));
    }

    @Test
    void testClassifyTransaction_RuleEngineHit() {
        // Arrange
        String cacheKey = "merchant:category:1:starbucks";
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(cacheKey)).thenReturn(null);
        when(merchantMappingRepository.findByUserIdAndMerchantNameIgnoreCase(1L, "Starbucks"))
            .thenReturn(Optional.empty());
        when(merchantMappingRepository.findGlobalMappingIgnoreCase("Starbucks"))
            .thenReturn(Optional.empty());
        
        // Mock finding/creating Food category
        when(categoryRepository.findByUserIdAndNameAndType(1L, "Food", CategoryType.EXPENSE)).thenReturn(Optional.of(category));

        // Act
        categoryClassificationService.classifyTransaction(transaction);

        // Assert
        assertNotNull(transaction.getCategory());
        assertEquals("Food", transaction.getCategory().getName());
        verify(valueOperations).set(eq(cacheKey), eq("100"), any(Duration.class));
    }
}
