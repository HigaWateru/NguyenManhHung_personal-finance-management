package demo.server.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal totalBalance,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpense,
        List<RecentTransactionResponse> recentTransactions
) {
}