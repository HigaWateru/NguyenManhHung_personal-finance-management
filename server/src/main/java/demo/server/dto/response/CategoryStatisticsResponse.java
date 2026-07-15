package demo.server.dto.response;

import demo.server.common.enums.CategoryType;
import java.math.BigDecimal;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CategoryStatisticsResponse {
        private Long categoryId;
        private String categoryName;
        private CategoryType type;
        private BigDecimal totalAmount;
        private BigDecimal percentage;
}