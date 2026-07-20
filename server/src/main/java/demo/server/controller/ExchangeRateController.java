package demo.server.controller;

import demo.server.common.enums.CurrencyCode;
import demo.server.dto.response.ApiResponse;
import demo.server.entity.ExchangeRate;
import demo.server.service.ExchangeRateService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/exchange-rate", "/api/v1/exchange-rate"})
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExchangeRate>>> getAllRates() {
        List<ExchangeRate> rates = exchangeRateService.getAllRates();
        return ResponseEntity.ok(ApiResponse.success("Fetched all exchange rates", rates));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<ExchangeRate>>> getLatestRates() {
        List<ExchangeRate> rates = exchangeRateService.getLatestRates();
        return ResponseEntity.ok(ApiResponse.success("Fetched latest exchange rates", rates));
    }

    @GetMapping("/{currency}")
    public ResponseEntity<ApiResponse<ExchangeRate>> getRateByCurrency(@PathVariable("currency") String currency) {
        CurrencyCode code = CurrencyCode.valueOf(currency.toUpperCase());
        ExchangeRate rate = exchangeRateService.getRate(code);
        return ResponseEntity.ok(ApiResponse.success("Fetched exchange rate for " + currency, rate));
    }

    @org.springframework.web.bind.annotation.PostMapping("/sync")
    public ResponseEntity<ApiResponse<List<ExchangeRate>>> syncRates() {
        exchangeRateService.updateRatesFromApi();
        List<ExchangeRate> rates = exchangeRateService.getAllRates();
        return ResponseEntity.ok(ApiResponse.success("Updated exchange rates from market", rates));
    }
}
