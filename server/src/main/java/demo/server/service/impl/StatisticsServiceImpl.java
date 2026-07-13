package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.dto.response.CategoryStatisticsResponse;
import demo.server.dto.response.MonthlyStatisticsResponse;
import demo.server.dto.response.StatisticsResponse;
import demo.server.dto.response.YearlyStatisticsResponse;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.projection.CategoryAmountProjection;
import demo.server.repository.projection.MonthlyAmountProjection;
import demo.server.repository.projection.YearlyAmountProjection;
import demo.server.service.StatisticsService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse getStatistics(Long userId, Integer year) {
        int selectedYear = year == null ? LocalDate.now().getYear() : year;

        List<MonthlyStatisticsResponse> monthlyStatistics = buildMonthlyStatistics(userId, selectedYear);
        List<YearlyStatisticsResponse> yearlyStatistics = buildYearlyStatistics(userId);
        List<CategoryStatisticsResponse> categoryStatistics = buildCategoryStatistics(userId, selectedYear);

        return new StatisticsResponse(selectedYear, monthlyStatistics, yearlyStatistics, categoryStatistics);
    }

    private List<MonthlyStatisticsResponse> buildMonthlyStatistics(Long userId, int year) {
        LocalDate fromDate = LocalDate.of(year, 1, 1);
        LocalDate toDate = LocalDate.of(year, 12, 31);

        Map<Integer, BigDecimal> incomeByMonth = toMonthAmountMap(incomeRepository.sumAmountGroupByMonth(userId, fromDate, toDate));
        Map<Integer, BigDecimal> expenseByMonth = toMonthAmountMap(expenseRepository.sumAmountGroupByMonth(userId, fromDate, toDate));

        List<MonthlyStatisticsResponse> results = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            BigDecimal income = incomeByMonth.getOrDefault(month, ZERO);
            BigDecimal expense = expenseByMonth.getOrDefault(month, ZERO);

            results.add(new MonthlyStatisticsResponse(month, income, expense, income.subtract(expense)));
        }

        return results;
    }

    private List<YearlyStatisticsResponse> buildYearlyStatistics(Long userId) {
        Map<Integer, BigDecimal> incomeByYear = toYearAmountMap(incomeRepository.sumAmountGroupByYear(userId));
        Map<Integer, BigDecimal> expenseByYear = toYearAmountMap(expenseRepository.sumAmountGroupByYear(userId));

        return java.util.stream.Stream.concat(incomeByYear.keySet().stream(), expenseByYear.keySet().stream())
            .distinct()
            .sorted()
            .map(year -> {
                BigDecimal income = incomeByYear.getOrDefault(year, ZERO);
                BigDecimal expense = expenseByYear.getOrDefault(year, ZERO);
                return new YearlyStatisticsResponse(year, income, expense, income.subtract(expense));
            })
            .toList();
    }

    private List<CategoryStatisticsResponse> buildCategoryStatistics(Long userId, int year) {
        List<CategoryStatisticsResponse> results = new ArrayList<>();

        LocalDate fromDate = LocalDate.of(year, 1, 1);
        LocalDate toDate = LocalDate.of(year, 12, 31);

        List<CategoryAmountProjection> incomeByCategory = incomeRepository.sumAmountGroupByCategory(userId, fromDate, toDate);
        List<CategoryAmountProjection> expenseByCategory = expenseRepository.sumAmountGroupByCategory(userId, fromDate, toDate);

        BigDecimal totalIncome = sumCategoryTotals(incomeByCategory);
        BigDecimal totalExpense = sumCategoryTotals(expenseByCategory);

        incomeByCategory.forEach(item -> results.add(toCategoryResponse(item, CategoryType.INCOME, totalIncome)));
        expenseByCategory.forEach(item -> results.add(toCategoryResponse(item, CategoryType.EXPENSE, totalExpense)));

        results.sort(
                Comparator.comparing(CategoryStatisticsResponse::totalAmount, Comparator.reverseOrder())
                        .thenComparing(CategoryStatisticsResponse::categoryName)
        );

        return results;
    }

    private CategoryStatisticsResponse toCategoryResponse(CategoryAmountProjection item, CategoryType type,
            BigDecimal grandTotal) {
        BigDecimal amount = valueOrZero(item.getTotalAmount());
        BigDecimal percentage = ZERO;

        if (grandTotal.compareTo(ZERO) > 0) {
            percentage = amount.multiply(ONE_HUNDRED).divide(grandTotal, 2, RoundingMode.HALF_UP);
        }

        return new CategoryStatisticsResponse(item.getCategoryId(), item.getCategoryName(), type, amount, percentage);
    }

    private BigDecimal sumCategoryTotals(List<CategoryAmountProjection> items) {
        return items.stream()
            .map(CategoryAmountProjection::getTotalAmount)
            .map(this::valueOrZero)
            .reduce(ZERO, BigDecimal::add);
    }

    private Map<Integer, BigDecimal> toMonthAmountMap(List<MonthlyAmountProjection> items) {
        Map<Integer, BigDecimal> result = new LinkedHashMap<>();
        items.forEach(item -> result.put(item.getMonth(), valueOrZero(item.getTotalAmount())));
        return result;
    }

    private Map<Integer, BigDecimal> toYearAmountMap(List<YearlyAmountProjection> items) {
        Map<Integer, BigDecimal> result = new LinkedHashMap<>();
        items.forEach(item -> result.put(item.getYear(), valueOrZero(item.getTotalAmount())));
        return result;
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? ZERO : value;
    }
}