package demo.server.dto.response;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StatisticsResponse {
        private int selectedYear;
        private List<MonthlyStatisticsResponse> monthlyStatistics;
        private List<YearlyStatisticsResponse> yearlyStatistics;
        private List<CategoryStatisticsResponse> categoryStatistics;
}