package demo.server.dto.request;

import demo.server.common.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Category name is required")
        @Size(max = 50, message = "Category name must not exceed 50 characters")
        String name,

        @NotNull(message = "Category type is required")
        CategoryType type,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description
) {
}