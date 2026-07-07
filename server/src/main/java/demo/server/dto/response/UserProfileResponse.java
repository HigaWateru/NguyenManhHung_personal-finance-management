package demo.server.dto.response;

import demo.server.common.enums.CurrencyCode;
import java.time.LocalDateTime;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        String avatarUrl,
        String timezone,
        CurrencyCode currencyCode,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}