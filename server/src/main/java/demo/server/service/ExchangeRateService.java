package demo.server.service;

import demo.server.common.enums.CurrencyCode;
import demo.server.entity.ExchangeRate;
import java.math.BigDecimal;
import java.util.List;

public interface ExchangeRateService {
    /**
     * Get all exchange rates.
     * @return list of ExchangeRate
     */
    List<ExchangeRate> getAllRates();

    /**
     * Get latest exchange rates.
     * @return list of ExchangeRate
     */
    List<ExchangeRate> getLatestRates();

    /**
     * Get exchange rate for a specific currency.
     * @param code currency code
     * @return ExchangeRate
     */
    ExchangeRate getRate(CurrencyCode code);

    /**
     * Scheduled or manual update of exchange rates from external API.
     */
    void updateRatesFromApi();

    /**
     * Convert amount from one currency to another.
     * @param amount amount to convert
     * @param fromCode source currency code
     * @param toCode target currency code
     * @return converted amount
     */
    BigDecimal convert(BigDecimal amount, CurrencyCode fromCode, CurrencyCode toCode);
}
