package demo.server.dto.response;

import java.util.List;

public record StatisticsResponse(
        int selectedYear,
        List<MonthlyStatisticsResponse> monthlyStatistics,
        List<YearlyStatisticsResponse> yearlyStatistics,
        List<CategoryStatisticsResponse> categoryStatistics
) {
}