package demo.server.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "bank_accounts",
    uniqueConstraints = @UniqueConstraint(name = "uk_bank_accounts_plaid_account_id", columnNames = "plaid_account_id"),
    indexes = @Index(name = "idx_bank_accounts_user", columnList = "user_id")
)
public class BankAccount extends BaseEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @NotBlank
    @Column(name = "account_name", nullable = false)
    private String accountName;

    @NotBlank
    @Column(name = "account_type", nullable = false)
    private String accountType;

    @Column(name = "account_subtype")
    private String accountSubtype;

    @NotNull
    @Column(name = "current_balance", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @NotBlank
    @Column(name = "plaid_account_id", nullable = false)
    private String plaidAccountId;

    @NotBlank
    @Column(name = "plaid_item_id", nullable = false)
    private String plaidItemId;

    @NotBlank
    @Column(name = "plaid_access_token", nullable = false)
    private String plaidAccessToken;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @NotBlank
    @Column(name = "connection_status", nullable = false)
    @Builder.Default
    private String connectionStatus = "CONNECTED";

    public void updateBalance(BigDecimal balance) {
        this.currentBalance = balance;
    }

    public void updateLastSynced(LocalDateTime time) {
        this.lastSyncedAt = time;
    }

    public void setConnectionStatus(String status) {
        this.connectionStatus = status;
    }
}
