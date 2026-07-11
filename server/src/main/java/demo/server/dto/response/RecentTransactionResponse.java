package demo.server.dto.response;

import demo.server.common.enums.CategoryType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RecentTransactionResponse(
        Long id,
        CategoryType type,
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        LocalDate transactionDate,
        String note,
        LocalDateTime createdAt
) {
}