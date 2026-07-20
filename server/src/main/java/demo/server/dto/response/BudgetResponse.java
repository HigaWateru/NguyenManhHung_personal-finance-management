package demo.server.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BudgetResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private LocalDate startDate;
    private LocalDate endDate;
}