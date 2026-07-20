package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.common.enums.CurrencyCode;
import demo.server.dto.response.CategoryDistributionResponse;
import demo.server.dto.response.DashboardResponse;
import demo.server.dto.response.RecentTransactionResponse;
import demo.server.entity.Expense;
import demo.server.entity.Income;
import demo.server.entity.Transaction;
import demo.server.entity.User;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.TransactionRepository;
import demo.server.repository.UserRepository;
import demo.server.service.DashboardService;
import demo.server.service.ExchangeRateService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final Comparator<RecentTransactionResponse> RECENT_TRANSACTION_COMPARATOR =
        Comparator.comparing(RecentTransactionResponse::getTransactionDate, Comparator.reverseOrder())
            .thenComparing(RecentTransactionResponse::getCreatedAt, Comparator.reverseOrder());

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ExchangeRateService exchangeRateService;


    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        CurrencyCode baseCurrency = user.getCurrencyCode();
        CurrencyCode displayCurrency = user.getDisplayCurrency();

        BigDecimal totalIncome = valueOrZero(incomeRepository.sumAmountByUserId(userId));
        BigDecimal totalExpense = valueOrZero(expenseRepository.sumAmountByUserId(userId));
        
        BigDecimal plaidIncome = valueOrZero(transactionRepository.sumAmountByUserIdAndType(userId, CategoryType.INCOME));
        BigDecimal plaidExpense = valueOrZero(transactionRepository.sumAmountByUserIdAndType(userId, CategoryType.EXPENSE));
        
        totalIncome = totalIncome.add(plaidIncome);
        totalExpense = totalExpense.add(plaidExpense);

        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal monthlyIncome = valueOrZero(incomeRepository.sumAmountByUserIdAndTransactionDateBetween(userId, monthStart, monthEnd));
        BigDecimal monthlyExpense = valueOrZero(expenseRepository.sumAmountByUserIdAndTransactionDateBetween(userId, monthStart, monthEnd));

        BigDecimal plaidMonthlyIncome = valueOrZero(transactionRepository.sumAmountByUserIdAndTypeAndTransactionDateBetween(userId, CategoryType.INCOME, monthStart, monthEnd));
        BigDecimal plaidMonthlyExpense = valueOrZero(transactionRepository.sumAmountByUserIdAndTypeAndTransactionDateBetween(userId, CategoryType.EXPENSE, monthStart, monthEnd));

        monthlyIncome = monthlyIncome.add(plaidMonthlyIncome);
        monthlyExpense = monthlyExpense.add(plaidMonthlyExpense);

        // Convert summaries to display currency
        totalIncome = exchangeRateService.convert(totalIncome, baseCurrency, displayCurrency);
        totalExpense = exchangeRateService.convert(totalExpense, baseCurrency, displayCurrency);
        monthlyIncome = exchangeRateService.convert(monthlyIncome, baseCurrency, displayCurrency);
        monthlyExpense = exchangeRateService.convert(monthlyExpense, baseCurrency, displayCurrency);
        
        BigDecimal totalBalance = totalIncome.subtract(totalExpense);

        List<RecentTransactionResponse> recentTransactions = buildRecentTransactions(userId, baseCurrency, displayCurrency);
        List<CategoryDistributionResponse> categoryDistribution = buildCategoryDistribution(userId, monthStart, monthEnd, baseCurrency, displayCurrency);

        return DashboardResponse.builder()
            .totalIncome(totalIncome)
            .totalExpense(totalExpense)
            .totalBalance(totalBalance)
            .monthlyIncome(monthlyIncome)
            .monthlyExpense(monthlyExpense)
            .recentTransactions(recentTransactions)
            .categoryDistribution(categoryDistribution)
            .build();
    }

    private List<CategoryDistributionResponse> buildCategoryDistribution(Long userId, LocalDate monthStart, LocalDate monthEnd, CurrencyCode baseCurrency, CurrencyCode displayCurrency) {
        Map<String, BigDecimal> categoryAmountMap = new HashMap<>();

        // 1. Manual expenses
        List<Expense> manualExpenses = expenseRepository.findByUserIdAndTransactionDateBetween(userId, monthStart, monthEnd);
        for (Expense exp : manualExpenses) {
            String catName = exp.getCategory() != null ? exp.getCategory().getName() : "Others";
            BigDecimal converted = exchangeRateService.convert(exp.getAmount(), baseCurrency, displayCurrency);
            categoryAmountMap.put(catName, categoryAmountMap.getOrDefault(catName, ZERO).add(converted));
        }

        // 2. Plaid bank expenses
        List<Transaction> bankExpenses = transactionRepository.findByUserIdAndTransactionDateBetween(userId, monthStart, monthEnd);
        for (Transaction tx : bankExpenses) if (tx.getType() == CategoryType.EXPENSE) {
            String catName = tx.getCategory() != null ? tx.getCategory().getName() : "Others";
            BigDecimal converted = exchangeRateService.convert(tx.getOriginalAmount(), tx.getOriginalCurrency(), displayCurrency);
            categoryAmountMap.put(catName, categoryAmountMap.getOrDefault(catName, ZERO).add(converted));
        }

        BigDecimal totalSum = categoryAmountMap.values().stream().reduce(ZERO, BigDecimal::add);
        if (totalSum.compareTo(ZERO) <= 0) return List.of();

        List<CategoryDistributionResponse> list = new java.util.ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : categoryAmountMap.entrySet()) {
            BigDecimal amt = entry.getValue();
            BigDecimal pct = amt.multiply(new BigDecimal("100")).divide(totalSum, 1, java.math.RoundingMode.HALF_UP);
            list.add(CategoryDistributionResponse.builder()
                .categoryName(entry.getKey())
                .amount(amt)
                .percentage(pct)
                .build());
        }

        list.sort(Comparator.comparing(CategoryDistributionResponse::getAmount, Comparator.reverseOrder()));
        return list;
    }


    private List<RecentTransactionResponse> buildRecentTransactions(Long userId, CurrencyCode baseCurrency, CurrencyCode displayCurrency) {
        List<RecentTransactionResponse> incomes = incomeRepository.findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(userId)
            .stream().map(income -> toIncomeTransaction(income, baseCurrency, displayCurrency)).toList();

        List<RecentTransactionResponse> expenses = expenseRepository.findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(userId)
            .stream().map(expense -> toExpenseTransaction(expense, baseCurrency, displayCurrency)).toList();

        List<RecentTransactionResponse> bankTxs = transactionRepository.findTop5ByUserIdOrderByTransactionDateDescCreatedAtDesc(userId)
            .stream().map(tx -> toBankTransaction(tx, displayCurrency)).toList();

        return java.util.stream.Stream.of(incomes, expenses, bankTxs)
            .flatMap(List::stream)
            .sorted(RECENT_TRANSACTION_COMPARATOR)
            .limit(5)
            .toList();
    }

    private RecentTransactionResponse toIncomeTransaction(Income income, CurrencyCode baseCurrency, CurrencyCode displayCurrency) {
        BigDecimal convertedAmount = exchangeRateService.convert(income.getAmount(), baseCurrency, displayCurrency);
        return RecentTransactionResponse.builder()
            .id(income.getId())
            .type(CategoryType.INCOME)
            .categoryId(income.getCategory().getId())
            .categoryName(income.getCategory().getName())
            .amount(convertedAmount)
            .transactionDate(income.getTransactionDate())
            .note(income.getNote())
            .createdAt(income.getCreatedAt())
            .build();
    }

    private RecentTransactionResponse toExpenseTransaction(Expense expense, CurrencyCode baseCurrency, CurrencyCode displayCurrency) {
        BigDecimal convertedAmount = exchangeRateService.convert(expense.getAmount(), baseCurrency, displayCurrency);
        return RecentTransactionResponse.builder()
            .id(expense.getId())
            .type(CategoryType.EXPENSE)
            .categoryId(expense.getCategory().getId())
            .categoryName(expense.getCategory().getName())
            .amount(convertedAmount)
            .transactionDate(expense.getTransactionDate())
            .note(expense.getNote())
            .createdAt(expense.getCreatedAt())
            .build();
    }

    private RecentTransactionResponse toBankTransaction(Transaction transaction, CurrencyCode displayCurrency) {
        BigDecimal convertedAmount = exchangeRateService.convert(transaction.getOriginalAmount(), transaction.getOriginalCurrency(), displayCurrency);
        return RecentTransactionResponse.builder()
            .id(transaction.getId())
            .type(transaction.getType())
            .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
            .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : "Uncategorized")
            .amount(convertedAmount)
            .transactionDate(transaction.getTransactionDate())
            .note(transaction.getMerchantName() != null ? transaction.getMerchantName() : transaction.getNote())
            .createdAt(transaction.getCreatedAt())
            .build();
    }


    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? ZERO : value;
    }
}