package demo.server.dto.response;

import java.math.BigDecimal;

public record MonthlyStatisticsResponse(
        int month,
        BigDecimal income,
        BigDecimal expense,
        BigDecimal balance
) {
}