package demo.server.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoalProgressRequest {
    @NotNull
    @PositiveOrZero
    private BigDecimal currentAmount;
}