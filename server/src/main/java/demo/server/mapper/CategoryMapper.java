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
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getDescription(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}