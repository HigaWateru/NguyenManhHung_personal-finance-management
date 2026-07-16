package demo.server.controller;

import demo.server.dto.request.BudgetRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.BudgetResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.entity.Budget;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.BudgetService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        List<BudgetResponse> responses = budgetService.getBudgets(principal.getId()).stream()
            .map(this::toResponse)
            .toList();
        return ResponseEntity.ok(ApiResponse.success("Budgets fetched successfully", responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody BudgetRequest request
    ) {
        Budget budget = budgetService.createBudget(principal.getId(), request.getCategoryId(), request.getLimitAmount());
        return ResponseEntity.ok(ApiResponse.success("Budget created successfully", toResponse(budget)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody BudgetRequest request
    ) {
        Budget budget = budgetService.updateBudget(principal.getId(), id, request.getLimitAmount());
        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully", toResponse(budget)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteBudget(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long id
    ) {
        budgetService.deleteBudget(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully", MessageResponse.builder().message("SUCCESS").build()));
    }

    private BudgetResponse toResponse(Budget budget) {
        BigDecimal spent = budgetService.getBudgetSpent(budget.getUser().getId(), budget.getCategory().getId());
        return BudgetResponse.builder()
            .id(budget.getId())
            .categoryId(budget.getCategory().getId())
            .categoryName(budget.getCategory().getName())
            .limitAmount(budget.getLimitAmount())
            .spentAmount(spent)
            .startDate(budget.getStartDate())
            .endDate(budget.getEndDate())
            .build();
    }
}
