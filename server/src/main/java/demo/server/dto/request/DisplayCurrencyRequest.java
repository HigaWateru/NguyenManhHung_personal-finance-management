package demo.server.dto.request;

import demo.server.common.enums.CurrencyCode;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DisplayCurrencyRequest {
    @NotNull
    private CurrencyCode displayCurrency;
}
