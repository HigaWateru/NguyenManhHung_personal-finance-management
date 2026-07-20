package demo.server.mapper;

import demo.server.common.enums.CategoryType;
import demo.server.dto.response.CategoryResponse;
import demo.server.entity.Category;
import demo.server.entity.User;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    public Category toEntity(User user, String name, CategoryType type, String description) {
        return Category.builder()
            .user(user)
            .name(name)
            .type(type)
            .description(description)
            .build();
    }

    public CategoryResponse toResponse(Category category) {
        long transactionCount = 0;
        if (category.getIncomes() != null) transactionCount += category.getIncomes().size();
        if (category.getExpenses() != null) transactionCount += category.getExpenses().size();

        return CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .type(category.getType())
            .description(category.getDescription())
            .transactionCount(transactionCount)
            .createdAt(category.getCreatedAt())
            .updatedAt(category.getUpdatedAt())
            .build();
    }
}