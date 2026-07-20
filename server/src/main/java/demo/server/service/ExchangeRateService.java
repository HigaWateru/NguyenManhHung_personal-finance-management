package demo.server.service;

import demo.server.common.enums.CurrencyCode;
import demo.server.entity.ExchangeRate;
import java.math.BigDecimal;
import java.util.List;

public interface ExchangeRateService {
    List<ExchangeRate> getAllRates();
    List<ExchangeRate> getLatestRates();
    ExchangeRate getRate(CurrencyCode code);
    void updateRatesFromApi();
    BigDecimal convert(BigDecimal amount, CurrencyCode fromCode, CurrencyCode toCode);
}