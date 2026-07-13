package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.dto.response.DashboardResponse;
import demo.server.dto.response.RecentTransactionResponse;
import demo.server.entity.Expense;
import demo.server.entity.Income;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.IncomeRepository;
import demo.server.service.DashboardService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final Comparator<RecentTransactionResponse> RECENT_TRANSACTION_COMPARATOR =
        Comparator.comparing(RecentTransactionResponse::transactionDate, Comparator.reverseOrder())
            .thenComparing(RecentTransactionResponse::createdAt, Comparator.reverseOrder());

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        BigDecimal totalIncome = valueOrZero(incomeRepository.sumAmountByUserId(userId));
        BigDecimal totalExpense = valueOrZero(expenseRepository.sumAmountByUserId(userId));
        BigDecimal totalBalance = totalIncome.subtract(totalExpense);

        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal monthlyIncome = valueOrZero(incomeRepository.sumAmountByUserIdAndTransactionDateBetween(userId, monthStart, monthEnd));
        BigDecimal monthlyExpense = valueOrZero(expenseRepository.sumAmountByUserIdAndTransactionDateBetween(userId, monthStart, monthEnd));

        List<RecentTransactionResponse> recentTransactions = buildRecentTransactions(userId);

        return new DashboardResponse(
            totalIncome,
            totalExpense,
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            recentTransactions
        );
    }

    private List<RecentTransactionResponse> buildRecentTransactions(Long userId) {
        List<RecentTransactionResponse> incomes = incomeRepository.findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(userId)
            .stream()
            .map(this::toIncomeTransaction)
            .toList();

        List<RecentTransactionResponse> expenses = expenseRepository.findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(userId)
            .stream()
            .map(this::toExpenseTransaction)
            .toList();

        return java.util.stream.Stream.concat(incomes.stream(), expenses.stream())
            .sorted(RECENT_TRANSACTION_COMPARATOR)
            .limit(5)
            .toList();
    }

    private RecentTransactionResponse toIncomeTransaction(Income income) {
        return new RecentTransactionResponse(
            income.getId(),
            CategoryType.INCOME,
            income.getCategory().getId(),
            income.getCategory().getName(),
            income.getAmount(),
            income.getTransactionDate(),
            income.getNote(),
            income.getCreatedAt()
        );
    }

    private RecentTransactionResponse toExpenseTransaction(Expense expense) {
        return new RecentTransactionResponse(
            expense.getId(),
            CategoryType.EXPENSE,
            expense.getCategory().getId(),
            expense.getCategory().getName(),
            expense.getAmount(),
            expense.getTransactionDate(),
            expense.getNote(),
            expense.getCreatedAt()
        );
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? ZERO : value;
    }
}