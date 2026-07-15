package demo.server.service.impl;

import demo.server.common.enums.CategoryType;
import demo.server.dto.request.CategoryRequest;
import demo.server.dto.response.CategoryResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.entity.Category;
import demo.server.entity.User;
import demo.server.exception.ApiException;
import demo.server.mapper.CategoryMapper;
import demo.server.repository.CategoryRepository;
import demo.server.repository.UserRepository;
import demo.server.service.CategoryService;
import demo.server.service.impl.support.ServiceInputUtils;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long userId, CategoryType type) {
        List<Category> categories = type == null
            ? categoryRepository.findByUserIdOrderByNameAsc(userId)
            : categoryRepository.findByUserIdAndTypeOrderByNameAsc(userId, type);

        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long userId, Long categoryId) {
        return categoryMapper.toResponse(findOwnedCategory(userId, categoryId));
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        User user = findActiveUser(userId);
        String normalizedName = normalizeName(request.getName());
        String normalizedDescription = normalizeDescription(request.getDescription());

        validateDuplicateCategory(userId, normalizedName, request.getType(), null);

        Category category = categoryMapper.toEntity(user, normalizedName, request.getType(), normalizedDescription);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long userId, Long categoryId, CategoryRequest request) {
        Category category = findOwnedCategory(userId, categoryId);
        String normalizedName = normalizeName(request.getName());
        String normalizedDescription = normalizeDescription(request.getDescription());

        validateDuplicateCategory(userId, normalizedName, request.getType(), categoryId);
        validateTypeChange(category, request.getType());

        category.updateDetails(normalizedName, request.getType(), normalizedDescription);
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public MessageResponse deleteCategory(Long userId, Long categoryId) {
        Category category = findOwnedCategory(userId, categoryId);
        validateCategoryDeletion(category);
        categoryRepository.delete(category);
        return MessageResponse.builder().message("Category deleted successfully").build();
    }

    private Category findOwnedCategory(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> ApiException.notFound("Category not found"));
    }

    private User findActiveUser(Long userId) {
        return userRepository.findByIdAndActiveTrue(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private void validateDuplicateCategory(Long userId, String name, CategoryType type, Long excludedCategoryId) {
        boolean exists = excludedCategoryId == null
            ? categoryRepository.existsByUserIdAndNameIgnoreCaseAndType(userId, name, type)
            : categoryRepository.existsByUserIdAndNameIgnoreCaseAndTypeAndIdNot(userId, name, type, excludedCategoryId);

        if (exists) throw ApiException.conflict("Category already exists");
    }

    private void validateTypeChange(Category category, CategoryType newType) {
        if (category.getType() == newType) return;

        if (!category.getIncomes().isEmpty() || !category.getExpenses().isEmpty()) {
            throw ApiException.conflict("Cannot change category type when transactions exist");
        }
    }

    private void validateCategoryDeletion(Category category) {
        if (!category.getIncomes().isEmpty() || !category.getExpenses().isEmpty()) {
            throw ApiException.conflict("Cannot delete category that is in use");
        }
    }

    private String normalizeName(String name) {
        return name.trim();
    }

    private String normalizeDescription(String description) {
        return ServiceInputUtils.normalizeOptionalText(description);
    }
}