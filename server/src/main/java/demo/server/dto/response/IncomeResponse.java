package demo.server.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record IncomeResponse(
        Long id,
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        LocalDate transactionDate,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}