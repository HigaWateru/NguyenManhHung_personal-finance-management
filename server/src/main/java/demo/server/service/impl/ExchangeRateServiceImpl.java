package demo.server.service.impl;

import demo.server.common.enums.CurrencyCode;
import demo.server.entity.ExchangeRate;
import demo.server.repository.ExchangeRateRepository;
import demo.server.service.ExchangeRateService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRateServiceImpl implements ExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Transactional(readOnly = true)
    public List<ExchangeRate> getAllRates() {
        return exchangeRateRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExchangeRate> getLatestRates() {
        return exchangeRateRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public ExchangeRate getRate(CurrencyCode code) {
        return exchangeRateRepository.findByCurrencyCode(code)
            .orElseThrow(() -> new IllegalArgumentException("Exchange rate not found for: " + code));
    }

    @Override
    @Transactional
    public void updateRatesFromApi() {
        log.info("Starting daily exchange rate update from API...");
        try {
            String url = "https://open.er-api.com/v6/latest/USD";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || !"success".equalsIgnoreCase((String) response.get("result"))) {
                log.error("API response was unsuccessful or empty");
                return;
            }

            Map<String, Object> ratesMap = (Map<String, Object>) response.get("rates");
            if (ratesMap == null) {
                log.error("Rates structure missing in API response");
                return;
            }

            BigDecimal vndRate = getBigDecimal(ratesMap.get("VND"));
            if (vndRate == null) {
                log.error("VND rate missing in API response, cannot calculate rateToVnd");
                return;
            }

            updateOrSaveRate(CurrencyCode.VND, "Vietnamese Dong", "₫", BigDecimal.ONE);
            updateOrSaveRate(CurrencyCode.USD, "US Dollar", "$", vndRate);

            BigDecimal eurRate = getBigDecimal(ratesMap.get("EUR"));
            if (eurRate != null) {
                BigDecimal eurToVnd = vndRate.divide(eurRate, 4, RoundingMode.HALF_UP);
                updateOrSaveRate(CurrencyCode.EUR, "Euro", "€", eurToVnd);
            }

            BigDecimal jpyRate = getBigDecimal(ratesMap.get("JPY"));
            if (jpyRate != null) {
                BigDecimal jpyToVnd = vndRate.divide(jpyRate, 4, RoundingMode.HALF_UP);
                updateOrSaveRate(CurrencyCode.JPY, "Japanese Yen", "¥", jpyToVnd);
            }

            log.info("Exchange rates updated successfully.");
        } catch (Exception e) {
            log.error("Error occurred while updating exchange rates. Keeping existing rates in DB.", e);
        }
    }

    private void updateOrSaveRate(CurrencyCode code, String name, String symbol, BigDecimal newRateToVnd) {
        Optional<ExchangeRate> existingOpt = exchangeRateRepository.findByCurrencyCode(code);
        if (existingOpt.isPresent()) {
            ExchangeRate rate = existingOpt.get();
            BigDecimal oldRate = rate.getRateToVnd();
            BigDecimal changePercent = BigDecimal.ZERO;
            if (oldRate.compareTo(BigDecimal.ZERO) > 0) {
                changePercent = newRateToVnd.subtract(oldRate)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(oldRate, 4, RoundingMode.HALF_UP);
            }
            rate.updateRate(newRateToVnd, changePercent);
            exchangeRateRepository.save(rate);
        } else {
            ExchangeRate rate = ExchangeRate.builder()
                .currencyCode(code)
                .currencyName(name)
                .symbol(symbol)
                .rateToVnd(newRateToVnd)
                .rateChangePercent(BigDecimal.ZERO)
                .build();
            exchangeRateRepository.save(rate);
        }
    }

    @Override
    public BigDecimal convert(BigDecimal amount, CurrencyCode fromCode, CurrencyCode toCode) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }
        if (fromCode == toCode) {
            return amount;
        }

        ExchangeRate fromRateEntity = exchangeRateRepository.findByCurrencyCode(fromCode)
            .orElse(null);
        ExchangeRate toRateEntity = exchangeRateRepository.findByCurrencyCode(toCode)
            .orElse(null);

        // Fallbacks if not seeded
        BigDecimal fromRate = fromRateEntity != null ? fromRateEntity.getRateToVnd() : getFallbackRate(fromCode);
        BigDecimal toRate = toRateEntity != null ? toRateEntity.getRateToVnd() : getFallbackRate(toCode);

        // formula: amount * rateToVnd(fromCode) / rateToVnd(toCode)
        BigDecimal amountInVnd = amount.multiply(fromRate);
        return amountInVnd.divide(toRate, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal getFallbackRate(CurrencyCode code) {
        switch (code) {
            case USD: return BigDecimal.valueOf(25450.0);
            case EUR: return BigDecimal.valueOf(27663.0);
            case JPY: return BigDecimal.valueOf(160.5);
            case VND:
            default:
                return BigDecimal.ONE;
        }
    }

    private BigDecimal getBigDecimal(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) {
            return BigDecimal.valueOf(((Number) obj).doubleValue());
        }
        return new BigDecimal(obj.toString());
    }
}
