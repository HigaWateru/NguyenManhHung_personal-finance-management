package demo.server.dto.response;

import demo.server.common.enums.CategoryType;
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
public class CategoryResponse {
        private Long id;
        private String name;
        private CategoryType type;
        private String description;
        private long transactionCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
}