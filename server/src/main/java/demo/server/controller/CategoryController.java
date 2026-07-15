package demo.server.controller;

import demo.server.common.enums.CategoryType;
import demo.server.dto.request.CategoryRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.CategoryResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.CategoryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @RequestParam(required = false) CategoryType type
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Categories fetched successfully", categoryService.getCategories(principal.getId(), type))
        );
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategory(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long categoryId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Category fetched successfully", categoryService.getCategory(principal.getId(), categoryId))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Category created successfully", categoryService.createCategory(principal.getId(), request)));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long categoryId,
        @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Category updated successfully", categoryService.updateCategory(principal.getId(), categoryId, request))
        );
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteCategory(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long categoryId
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Category deleted successfully", categoryService.deleteCategory(principal.getId(), categoryId))
        );
    }
}