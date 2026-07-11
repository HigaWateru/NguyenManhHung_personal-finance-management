package demo.server.repository.projection;

import java.math.BigDecimal;

public interface YearlyAmountProjection {

    Integer getYear();

    BigDecimal getTotalAmount();
}