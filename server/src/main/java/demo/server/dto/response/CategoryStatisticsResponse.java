package demo.server.dto.response;

import demo.server.common.enums.CategoryType;
import java.math.BigDecimal;

public record CategoryStatisticsResponse(
        Long categoryId,
        String categoryName,
        CategoryType type,
        BigDecimal totalAmount,
        BigDecimal percentage
) {
}