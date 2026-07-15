package demo.server.dto.response;

import demo.server.common.enums.CategoryType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecentTransactionResponse {
        private Long id;
        private CategoryType type;
        private Long categoryId;
        private String categoryName;
        private BigDecimal amount;
        private LocalDate transactionDate;
        private String note;
        private LocalDateTime createdAt;
}