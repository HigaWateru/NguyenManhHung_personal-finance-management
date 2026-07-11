package demo.server.repository.projection;

import java.math.BigDecimal;

public interface CategoryAmountProjection {

    Long getCategoryId();

    String getCategoryName();

    BigDecimal getTotalAmount();
}