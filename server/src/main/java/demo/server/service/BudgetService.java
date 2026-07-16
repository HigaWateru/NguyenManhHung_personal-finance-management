package demo.server.service;

import demo.server.entity.Budget;
import java.math.BigDecimal;
import java.util.List;

public interface BudgetService {
    List<Budget> getBudgets(Long userId);
    Budget createBudget(Long userId, Long categoryId, BigDecimal limitAmount);
    Budget updateBudget(Long userId, Long budgetId, BigDecimal limitAmount);
    void deleteBudget(Long userId, Long budgetId);
    BigDecimal getBudgetSpent(Long userId, Long categoryId);
}
