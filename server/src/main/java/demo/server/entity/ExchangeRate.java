package demo.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import demo.server.common.enums.CurrencyCode;

@Getter
@SuperBuilder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "exchange_rates")
public class ExchangeRate extends BaseEntity {
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "currency_code", nullable = false, unique = true, length = 10)
    private CurrencyCode currencyCode;

    @NotNull
    @Column(name = "currency_name", nullable = false, length = 100)
    private String currencyName;

    @NotNull
    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @NotNull
    @Column(name = "rate_to_vnd", nullable = false, precision = 19, scale = 4)
    private BigDecimal rateToVnd;

    @Column(name = "rate_change_percent", precision = 19, scale = 4)
    private BigDecimal rateChangePercent;

    public void updateRate(BigDecimal rateToVnd, BigDecimal rateChangePercent) {
        this.rateToVnd = rateToVnd;
        this.rateChangePercent = rateChangePercent;
    }
}
