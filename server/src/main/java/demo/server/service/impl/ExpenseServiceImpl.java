package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.common.enums.CurrencyCode;
import demo.server.dto.request.ExpenseRequest;
import demo.server.dto.response.ExpenseResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import demo.server.entity.Category;
import demo.server.entity.Expense;
import demo.server.entity.User;
import demo.server.exception.ApiException;
import demo.server.mapper.ExpenseMapper;
import demo.server.repository.CategoryRepository;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.UserRepository;
import demo.server.service.ExchangeRateService;
import demo.server.service.ExpenseService;
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
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ExpenseMapper expenseMapper;
    private final ExchangeRateService exchangeRateService;


    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExpenseResponse> getExpenses(Long userId, Long categoryId, LocalDate fromDate,
            LocalDate toDate, String keyword, int page, int size) {
        ServiceInputUtils.validateDateRange(fromDate, toDate);

        User user = findActiveUser(userId);
        CurrencyCode baseCurrency = user.getCurrencyCode();
        CurrencyCode displayCurrency = user.getDisplayCurrency();

        Page<ExpenseResponse> expenses = expenseRepository.search(userId, categoryId, fromDate, toDate,
            ServiceInputUtils.normalizeOptionalText(keyword),
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate", "createdAt"))
        ).map(expense -> {
            ExpenseResponse response = expenseMapper.toResponse(expense);
            BigDecimal convertedAmount = exchangeRateService.convert(response.getAmount(), baseCurrency, displayCurrency);
            return ExpenseResponse.builder()
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

        return PageResponse.from(expenses);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpense(Long userId, Long expenseId) {
        User user = findActiveUser(userId);
        Expense expense = findOwnedExpense(userId, expenseId);
        ExpenseResponse response = expenseMapper.toResponse(expense);
        BigDecimal convertedAmount = exchangeRateService.convert(response.getAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        return ExpenseResponse.builder()
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
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = findActiveUser(userId);
        Category category = findCategory(userId, request.getCategoryId(), CategoryType.EXPENSE);

        BigDecimal amountInBase = exchangeRateService.convert(request.getAmount(), user.getDisplayCurrency(), user.getCurrencyCode());

        Expense expense = expenseMapper.toEntity(
            user,
            category,
            amountInBase,
            request.getTransactionDate(),
            ServiceInputUtils.normalizeOptionalText(request.getNote())
        );

        Expense saved = expenseRepository.save(expense);
        ExpenseResponse response = expenseMapper.toResponse(saved);
        BigDecimal amountInDisplay = exchangeRateService.convert(response.getAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        return ExpenseResponse.builder()
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
    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        User user = findActiveUser(userId);
        Expense expense = findOwnedExpense(userId, expenseId);
        Category category = findCategory(userId, request.getCategoryId(), CategoryType.EXPENSE);

        BigDecimal amountInBase = exchangeRateService.convert(request.getAmount(), user.getDisplayCurrency(), user.getCurrencyCode());

        expense.updateDetails(
            category,
            amountInBase,
            request.getTransactionDate(),
            ServiceInputUtils.normalizeOptionalText(request.getNote())
        );

        ExpenseResponse response = expenseMapper.toResponse(expense);
        BigDecimal amountInDisplay = exchangeRateService.convert(response.getAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        return ExpenseResponse.builder()
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
    public MessageResponse deleteExpense(Long userId, Long expenseId) {
        Expense expense = findOwnedExpense(userId, expenseId);
        expenseRepository.delete(expense);
        return MessageResponse.builder().message("Expense deleted successfully").build();
    }

    private Expense findOwnedExpense(Long userId, Long expenseId) {
        return expenseRepository.findByIdAndUserId(expenseId, userId)
            .orElseThrow(() -> ApiException.notFound("Expense not found"));
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