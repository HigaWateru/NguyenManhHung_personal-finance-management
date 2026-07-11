package demo.server.dto.response;

import java.math.BigDecimal;

public record YearlyStatisticsResponse(
        int year,
        BigDecimal income,
        BigDecimal expense,
        BigDecimal balance
) {
}