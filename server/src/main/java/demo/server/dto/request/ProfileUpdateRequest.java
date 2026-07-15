package demo.server.dto.request;

import demo.server.common.enums.CurrencyCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProfileUpdateRequest {
                @NotBlank(message = "Full name is required")
                @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
                private String fullName;

                @NotBlank(message = "Timezone is required")
                @Size(max = 50, message = "Timezone must not exceed 50 characters")
                private String timezone;

                @NotNull(message = "Currency code is required")
                private CurrencyCode currencyCode;
}
