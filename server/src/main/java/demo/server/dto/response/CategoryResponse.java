package demo.server.dto.response;

import demo.server.common.enums.CategoryType;
import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String name,
        CategoryType type,
        String description,
        long transactionCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}