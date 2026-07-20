package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.entity.Budget;
import demo.server.entity.Category;
import demo.server.entity.User;
import demo.server.repository.BudgetRepository;
import demo.server.repository.CategoryRepository;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.TransactionRepository;
import demo.server.repository.UserRepository;
import demo.server.service.BudgetService;
import demo.server.service.ExchangeRateService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;


    @Override
    @Transactional(readOnly = true)
    public List<Budget> getBudgets(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Budget createBudget(Long userId, Long categoryId, BigDecimal limitAmount) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new IllegalArgumentException("Category not found: " + categoryId));

        if (!category.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized category");
        }

        // Limit amount is received in display currency, convert to user base currency for storage
        BigDecimal limitInBase = exchangeRateService.convert(limitAmount, user.getDisplayCurrency(), user.getCurrencyCode());

        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        // Check if budget already exists for this month
        return budgetRepository.findByUserIdAndCategoryIdAndStartDateAndEndDate(userId, categoryId, start, end)
            .map(existing -> {
                existing.updateLimit(limitInBase);
                return budgetRepository.save(existing);
            })
            .orElseGet(() -> {
                Budget budget = Budget.builder()
                    .user(user)
                    .category(category)
                    .limitAmount(limitInBase)
                    .startDate(start)
                    .endDate(end)
                    .period("MONTHLY")
                    .build();
                return budgetRepository.save(budget);
            });
    }

    @Override
    @Transactional
    public Budget updateBudget(Long userId, Long budgetId, BigDecimal limitAmount) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new IllegalArgumentException("Budget not found: " + budgetId));

        if (!budget.getUser().getId().equals(userId)) throw new IllegalArgumentException("Unauthorized budget access");

        User user = budget.getUser();
        BigDecimal limitInBase = exchangeRateService.convert(limitAmount, user.getDisplayCurrency(), user.getCurrencyCode());

        budget.updateLimit(limitInBase);
        return budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
            .orElseThrow(() -> new IllegalArgumentException("Budget not found: " + budgetId));

        if (!budget.getUser().getId().equals(userId)) throw new IllegalArgumentException("Unauthorized budget access");

        budgetRepository.delete(budget);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getBudgetSpent(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        LocalDate now = LocalDate.now();
        LocalDate start = now.withDayOfMonth(1);
        LocalDate end = now.withDayOfMonth(now.lengthOfMonth());

        // Manual expenses spent
        BigDecimal manualSpent = expenseRepository.sumAmountByUserIdAndCategoryIdAndTransactionDateBetween(userId, categoryId, start, end);
        if (manualSpent == null) manualSpent = BigDecimal.ZERO;

        // Bank sync transactions spent (where type is EXPENSE)
        BigDecimal bankSpent = transactionRepository.sumAmountByUserIdAndCategoryIdAndTypeAndTransactionDateBetween(userId, categoryId, CategoryType.EXPENSE, start, end);
        if (bankSpent == null) bankSpent = BigDecimal.ZERO;

        BigDecimal totalSpentInBase = manualSpent.add(bankSpent);
        return exchangeRateService.convert(totalSpentInBase, user.getCurrencyCode(), user.getDisplayCurrency());
    }

}