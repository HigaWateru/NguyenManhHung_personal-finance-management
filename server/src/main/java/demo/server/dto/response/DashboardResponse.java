package demo.server.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DashboardResponse {
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal totalBalance;
        private BigDecimal monthlyIncome;
        private BigDecimal monthlyExpense;
        private List<RecentTransactionResponse> recentTransactions;
}