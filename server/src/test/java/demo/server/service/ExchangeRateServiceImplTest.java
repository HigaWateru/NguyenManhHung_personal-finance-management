package demo.server.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

import demo.server.common.enums.CurrencyCode;
import demo.server.entity.ExchangeRate;
import demo.server.repository.ExchangeRateRepository;
import demo.server.service.impl.ExchangeRateServiceImpl;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class ExchangeRateServiceImplTest {

    @Mock
    private ExchangeRateRepository exchangeRateRepository;

    @InjectMocks
    private ExchangeRateServiceImpl exchangeRateService;

    private ExchangeRate usdRate;
    private ExchangeRate eurRate;

    @BeforeEach
    void setUp() {
        usdRate = ExchangeRate.builder()
            .currencyCode(CurrencyCode.USD)
            .currencyName("US Dollar")
            .symbol("$")
            .rateToVnd(BigDecimal.valueOf(25450.0))
            .build();

        eurRate = ExchangeRate.builder()
            .currencyCode(CurrencyCode.EUR)
            .currencyName("Euro")
            .symbol("€")
            .rateToVnd(BigDecimal.valueOf(27663.0))
            .build();
    }

    @Test
    void getAllRates_returnsAllRates() {
        when(exchangeRateRepository.findAll()).thenReturn(Arrays.asList(usdRate, eurRate));
        List<ExchangeRate> result = exchangeRateService.getAllRates();
        assertEquals(2, result.size());
        assertEquals(CurrencyCode.USD, result.get(0).getCurrencyCode());
    }

    @Test
    void convert_sameCurrency_returnsSameAmount() {
        BigDecimal amount = BigDecimal.valueOf(100.0);
        BigDecimal result = exchangeRateService.convert(amount, CurrencyCode.USD, CurrencyCode.USD);
        assertEquals(0, amount.compareTo(result));
    }

    @Test
    void convert_usdToVnd_returnsCorrectAmount() {
        BigDecimal amount = BigDecimal.valueOf(100.0);
        when(exchangeRateRepository.findByCurrencyCode(CurrencyCode.USD)).thenReturn(Optional.of(usdRate));
        when(exchangeRateRepository.findByCurrencyCode(CurrencyCode.VND)).thenReturn(Optional.of(
            ExchangeRate.builder().currencyCode(CurrencyCode.VND).rateToVnd(BigDecimal.ONE).build()
        ));

        BigDecimal result = exchangeRateService.convert(amount, CurrencyCode.USD, CurrencyCode.VND);
        BigDecimal expected = amount.multiply(usdRate.getRateToVnd());
        assertEquals(0, expected.compareTo(result));
    }

    @Test
    void convert_usdToEur_returnsCorrectAmount() {
        BigDecimal amount = BigDecimal.valueOf(100.0);
        when(exchangeRateRepository.findByCurrencyCode(CurrencyCode.USD)).thenReturn(Optional.of(usdRate));
        when(exchangeRateRepository.findByCurrencyCode(CurrencyCode.EUR)).thenReturn(Optional.of(eurRate));

        BigDecimal result = exchangeRateService.convert(amount, CurrencyCode.USD, CurrencyCode.EUR);
        BigDecimal amountInVnd = amount.multiply(usdRate.getRateToVnd());
        BigDecimal expected = amountInVnd.divide(eurRate.getRateToVnd(), 2, java.math.RoundingMode.HALF_UP);
        assertEquals(0, expected.compareTo(result));
    }
}
