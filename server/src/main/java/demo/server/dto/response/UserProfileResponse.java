package demo.server.dto.response;

import demo.server.common.enums.CurrencyCode;
import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfileResponse {
        private Long id;
        private String fullName;
        private String email;
        private String avatarUrl;
        private String timezone;
        private CurrencyCode currencyCode;
        private CurrencyCode displayCurrency;
        private boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
}