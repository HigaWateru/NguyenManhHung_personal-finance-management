package demo.server.repository.projection;

import java.math.BigDecimal;

public interface MonthlyAmountProjection {
    Integer getMonth();
    BigDecimal getTotalAmount();
}