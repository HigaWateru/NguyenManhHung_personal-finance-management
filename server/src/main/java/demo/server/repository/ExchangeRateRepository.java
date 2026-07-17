package demo.server.repository;

import demo.server.common.enums.CurrencyCode;
import demo.server.entity.ExchangeRate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findByCurrencyCode(CurrencyCode currencyCode);
}
