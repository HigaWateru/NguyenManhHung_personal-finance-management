package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.entity.Category;
import demo.server.entity.MerchantMapping;
import demo.server.entity.Transaction;
import demo.server.entity.User;
import demo.server.repository.CategoryRepository;
import demo.server.repository.MerchantMappingRepository;
import demo.server.service.AiCategorizerService;
import demo.server.service.CategoryClassificationService;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryClassificationServiceImpl implements CategoryClassificationService {

    private final StringRedisTemplate redisTemplate;
    private final MerchantMappingRepository merchantMappingRepository;
    private final CategoryRepository categoryRepository;
    private final AiCategorizerService aiCategorizerService;

    private static final String CACHE_KEY_PREFIX = "merchant:category:";

    @Override
    @Transactional
    public void classifyTransaction(Transaction transaction) {
        if (transaction.getCategory() != null) {
            return;
        }

        Long userId = transaction.getUser().getId();
        String merchant = transaction.getMerchantName();
        String note = transaction.getNote();
        String lookupName = (merchant != null && !merchant.trim().isEmpty()) ? merchant.trim() : note;

        if (lookupName == null || lookupName.trim().isEmpty()) {
            // Assign default Uncategorized category if name is empty
            Category defaultCat = getOrCreateDefaultCategory(transaction, "Others");
            transaction.updateCategory(defaultCat);
            return;
        }

        lookupName = lookupName.trim();
        String cacheKey = CACHE_KEY_PREFIX + userId + ":" + lookupName.toLowerCase();

        // 1. Check Redis Cache
        try {
            String cachedCategoryId = redisTemplate.opsForValue().get(cacheKey);
            if (cachedCategoryId != null) {
                Long categoryId = Long.parseLong(cachedCategoryId);
                Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
                if (categoryOpt.isPresent() && categoryOpt.get().getUser().getId().equals(userId)) {
                    transaction.updateCategory(categoryOpt.get());
                    log.info("Transaction [ID: {}] classified via Redis Merchant Cache: {}", transaction.getId(), categoryOpt.get().getName());
                    return;
                }
            }
        } catch (Exception e) {
            log.error("Redis Cache check failed for lookup: {}", lookupName, e);
        }

        // 2. Check MerchantMapping
        Optional<MerchantMapping> mappingOpt = merchantMappingRepository.findByUserIdAndMerchantNameIgnoreCase(userId, lookupName);
        if (mappingOpt.isPresent()) {
            Category category = mappingOpt.get().getCategory();
            transaction.updateCategory(category);
            cacheCategory(cacheKey, category.getId());
            log.info("Transaction [ID: {}] classified via MerchantMapping: {}", transaction.getId(), category.getName());
            return;
        }

        // Check Global MerchantMapping
        Optional<MerchantMapping> globalOpt = merchantMappingRepository.findGlobalMappingIgnoreCase(lookupName);
        if (globalOpt.isPresent()) {
            // Check if user has category of the same name or type
            Category globalCat = globalOpt.get().getCategory();
            Category userCat = findOrCreateMatchingCategory(transaction.getUser(), globalCat.getName(), transaction.getType());
            transaction.updateCategory(userCat);
            cacheCategory(cacheKey, userCat.getId());
            log.info("Transaction [ID: {}] classified via Global MerchantMapping: {}", transaction.getId(), userCat.getName());
            return;
        }

        // 3. Rule Engine
        Category ruleMatched = runRuleEngine(transaction, lookupName);
        if (ruleMatched != null) {
            transaction.updateCategory(ruleMatched);
            cacheCategory(cacheKey, ruleMatched.getId());
            log.info("Transaction [ID: {}] classified via Rule Engine: {}", transaction.getId(), ruleMatched.getName());
            return;
        }

        // 4. AI Categorizer
        List<Category> userCategories = categoryRepository.findByUserIdAndTypeOrderByNameAsc(userId, transaction.getType());
        Category aiMatched = aiCategorizerService.categorize(merchant, note, userCategories);
        if (aiMatched != null) {
            transaction.updateCategory(aiMatched);
            cacheCategory(cacheKey, aiMatched.getId());
            log.info("Transaction [ID: {}] classified via AI Categorizer: {}", transaction.getId(), aiMatched.getName());
            return;
        }

        // 5. Fallback Default
        Category fallbackCat = getOrCreateDefaultCategory(transaction, "Others");
        transaction.updateCategory(fallbackCat);
        cacheCategory(cacheKey, fallbackCat.getId());
        log.info("Transaction [ID: {}] classified via Fallback Category: {}", transaction.getId(), fallbackCat.getName());
    }

    private void cacheCategory(String cacheKey, Long categoryId) {
        try {
            redisTemplate.opsForValue().set(cacheKey, String.valueOf(categoryId), Duration.ofDays(30));
        } catch (Exception e) {
            log.error("Failed to write to Redis cache key: {}", cacheKey, e);
        }
    }

    private Category runRuleEngine(Transaction transaction, String lookupName) {
        String cleanText = lookupName.toLowerCase();
        Long userId = transaction.getUser().getId();
        CategoryType type = transaction.getType();

        // Standard categories and their keywords
        Map<String, String[]> rules = new HashMap<>();
        if (type == CategoryType.INCOME) {
            rules.put("Salary", new String[]{"salary", "payroll", "paycheck", "lương", "thu nhập"});
            rules.put("Bonus", new String[]{"bonus", "thưởng"});
            rules.put("Freelance", new String[]{"freelance", "upwork", "fiverr", "dự án"});
            rules.put("Interest", new String[]{"interest", "interest payment", "dividend", "yield", "lãi", "tiền lãi", "cổ tức", "tiết kiệm", "hoàn tiền", "refund", "cashback"});
        } else {
            rules.put("Food", new String[]{"starbucks", "mcdonald", "kfc", "restaurant", "pizza", "food", "cafe", "coffee", "cà phê", "uber eats", "grabfood", "foodpanda", "bakery", "sweetgreen", "royal farms", "smart & final", "dining", "quán ăn", "trà sữa"});
            rules.put("Transport", new String[]{"uber", "lyft", "grab", "taxi", "gas", "fuel", "petrol", "parking", "shell", "chevron", "di chuyển", "xăng"});
            rules.put("Shopping", new String[]{"amazon", "walmart", "target", "ebay", "shopee", "tiki", "lazada", "supermarket", "grocery", "mall", "apple", "nike", "adidas", "zara", "uniqlo", "cửa hàng"});
            rules.put("Entertainment", new String[]{"netflix", "spotify", "hulu", "steam", "playstation", "xbox", "cinema", "movie", "theater", "disney", "youtube", "nintendo", "game", "giải trí"});
            rules.put("Utilities", new String[]{"electric", "power", "water", "internet", "phone", "comcast", "verizon", "t-mobile", "openai", "chatgpt", "software", "subscription", "aws", "cloud", "google", "microsoft", "icloud", "fpt", "viettel", "vnpt", "điện nước"});
            rules.put("Health", new String[]{"pharmacy", "medical", "hospital", "doctor", "health", "dentist", "thuốc", "bệnh viện"});
        }

        for (Map.Entry<String, String[]> rule : rules.entrySet()) {
            for (String keyword : rule.getValue()) {
                if (cleanText.contains(keyword)) {
                    return findOrCreateMatchingCategory(transaction.getUser(), rule.getKey(), type);
                }
            }
        }

        return null;
    }

    private Category findOrCreateMatchingCategory(User user, String name, CategoryType type) {
        Optional<Category> existing = categoryRepository.findByUserIdAndNameAndType(user.getId(), name, type);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new category if not exists
        Category newCat = Category.builder()
            .user(user)
            .name(name)
            .type(type)
            .description("Auto created category for " + name)
            .build();
        return categoryRepository.saveAndFlush(newCat);
    }

    private Category getOrCreateDefaultCategory(Transaction transaction, String defaultName) {
        return findOrCreateMatchingCategory(transaction.getUser(), defaultName, transaction.getType());
    }
}
