package demo.server.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BankAccountResponse {
    private Long id;
    private String institutionName;
    private String accountName;
    private String accountType;
    private String accountSubtype;
    private BigDecimal currentBalance;
    private LocalDateTime lastSyncedAt;
    private String connectionStatus;
}
