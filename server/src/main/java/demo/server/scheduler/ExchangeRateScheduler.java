package demo.server.scheduler;

import demo.server.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExchangeRateScheduler {
    private final ExchangeRateService exchangeRateService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void scheduleDailyUpdate() {
        log.info("Triggering scheduled exchange rate update...");
        exchangeRateService.updateRatesFromApi();
    }
}