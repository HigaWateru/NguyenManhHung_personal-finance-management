package demo.server.service;

import demo.server.common.enums.CategoryType;
import demo.server.dto.request.CategoryRequest;
import demo.server.dto.response.CategoryResponse;
import demo.server.dto.response.MessageResponse;
import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getCategories(Long userId, CategoryType type);

    CategoryResponse getCategory(Long userId, Long categoryId);

    CategoryResponse createCategory(Long userId, CategoryRequest request);

    CategoryResponse updateCategory(Long userId, Long categoryId, CategoryRequest request);

    MessageResponse deleteCategory(Long userId, Long categoryId);
}