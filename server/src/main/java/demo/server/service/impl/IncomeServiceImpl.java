package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.common.enums.CurrencyCode;
import demo.server.dto.request.IncomeRequest;
import demo.server.dto.response.IncomeResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import demo.server.entity.Category;
import demo.server.entity.Income;
import demo.server.entity.User;
import demo.server.exception.ApiException;
import demo.server.mapper.IncomeMapper;
import demo.server.repository.CategoryRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.UserRepository;
import demo.server.service.ExchangeRateService;
import demo.server.service.IncomeService;
import demo.server.service.impl.support.ServiceInputUtils;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final IncomeMapper incomeMapper;
    private final ExchangeRateService exchangeRateService;


    @Override
    @Transactional(readOnly = true)
    public PageResponse<IncomeResponse> getIncomes(
        Long userId,
        Long categoryId,
        LocalDate fromDate,
        LocalDate toDate,
        String keyword,
        int page,
        int size
    ) {
        ServiceInputUtils.validateDateRange(fromDate, toDate);

        User user = findActiveUser(userId);
        CurrencyCode baseCurrency = user.getCurrencyCode();
        CurrencyCode displayCurrency = user.getDisplayCurrency();

        Page<IncomeResponse> incomes = incomeRepository.search(
                userId,
                categoryId,
                fromDate,
                toDate,
                ServiceInputUtils.normalizeOptionalText(keyword),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"))
            ).map(income -> {
                IncomeResponse response = incomeMapper.toResponse(income);
                BigDecimal convertedAmount = exchangeRateService.convert(response.getAmount(), baseCurrency, displayCurrency);
                return IncomeResponse.builder()
                    .id(response.getId())
                    .categoryId(response.getCategoryId())
                    .categoryName(response.getCategoryName())
                    .amount(convertedAmount)
                    .transactionDate(response.getTransactionDate())
                    .note(response.getNote())
                    .createdAt(response.getCreatedAt())
                    .updatedAt(response.getUpdatedAt())
                    .build();
            });

        return PageResponse.from(incomes);
    }

    @Override
    @Transactional(readOnly = true)
    public IncomeResponse getIncome(Long userId, Long incomeId) {
        User user = findActiveUser(userId);
        Income income = findOwnedIncome(userId, incomeId);
        IncomeResponse response = incomeMapper.toResponse(income);
        BigDecimal convertedAmount = exchangeRateService.convert(response.getAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        return IncomeResponse.builder()
            .id(response.getId())
            .categoryId(response.getCategoryId())
            .categoryName(response.getCategoryName())
            .amount(convertedAmount)
            .transactionDate(response.getTransactionDate())
            .note(response.getNote())
            .createdAt(response.getCreatedAt())
            .updatedAt(response.getUpdatedAt())
            .build();
    }

    @Override
    @Transactional
    public IncomeResponse createIncome(Long userId, IncomeRequest request) {
        User user = findActiveUser(userId);
        Category category = findCategory(userId, request.getCategoryId(), CategoryType.INCOME);

        BigDecimal amountInBase = exchangeRateService.convert(request.getAmount(), user.getDisplayCurrency(), user.getCurrencyCode());

        Income income = incomeMapper.toEntity(
            user,
            category,
            amountInBase,
            request.getTransactionDate(),
            ServiceInputUtils.normalizeOptionalText(request.getNote())
        );

        Income saved = incomeRepository.save(income);
        IncomeResponse response = incomeMapper.toResponse(saved);
        BigDecimal amountInDisplay = exchangeRateService.convert(response.getAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        return IncomeResponse.builder()
            .id(response.getId())
            .categoryId(response.getCategoryId())
            .categoryName(response.getCategoryName())
            .amount(amountInDisplay)
            .transactionDate(response.getTransactionDate())
            .note(response.getNote())
            .createdAt(response.getCreatedAt())
            .updatedAt(response.getUpdatedAt())
            .build();
    }

    @Override
    @Transactional
    public IncomeResponse updateIncome(Long userId, Long incomeId, IncomeRequest request) {
        User user = findActiveUser(userId);
        Income income = findOwnedIncome(userId, incomeId);
        Category category = findCategory(userId, request.getCategoryId(), CategoryType.INCOME);

        BigDecimal amountInBase = exchangeRateService.convert(request.getAmount(), user.getDisplayCurrency(), user.getCurrencyCode());

        income.updateDetails(
            category,
            amountInBase,
            request.getTransactionDate(),
            ServiceInputUtils.normalizeOptionalText(request.getNote())
        );

        IncomeResponse response = incomeMapper.toResponse(income);
        BigDecimal amountInDisplay = exchangeRateService.convert(response.getAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        return IncomeResponse.builder()
            .id(response.getId())
            .categoryId(response.getCategoryId())
            .categoryName(response.getCategoryName())
            .amount(amountInDisplay)
            .transactionDate(response.getTransactionDate())
            .note(response.getNote())
            .createdAt(response.getCreatedAt())
            .updatedAt(response.getUpdatedAt())
            .build();
    }


    @Override
    @Transactional
    public MessageResponse deleteIncome(Long userId, Long incomeId) {
        Income income = findOwnedIncome(userId, incomeId);
        incomeRepository.delete(income);
        return MessageResponse.builder().message("Income deleted successfully").build();
    }

    private Income findOwnedIncome(Long userId, Long incomeId) {
        return incomeRepository.findByIdAndUserId(incomeId, userId)
                .orElseThrow(() -> ApiException.notFound("Income not found"));
    }

    private User findActiveUser(Long userId) {
        return userRepository.findByIdAndActiveTrue(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private Category findCategory(Long userId, Long categoryId, CategoryType expectedType) {
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> ApiException.notFound("Category not found"));

        if (category.getType() != expectedType) throw ApiException.badRequest("Selected category type is invalid");

        return category;
    }

}