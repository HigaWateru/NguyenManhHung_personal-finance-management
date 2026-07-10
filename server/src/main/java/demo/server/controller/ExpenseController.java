package demo.server.controller;

import demo.server.dto.request.ExpenseRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.ExpenseResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.ExpenseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ExpenseResponse>>> getExpenses(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be greater than or equal to 0") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Size must be at least 1") @Max(value = 100, message = "Size must not exceed 100") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Expenses fetched successfully",
                expenseService.getExpenses(principal.id(), categoryId, fromDate, toDate, keyword, page, size)
        ));
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpense(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @PathVariable Long expenseId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Expense fetched successfully", expenseService.getExpense(principal.id(), expenseId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @Valid @RequestBody ExpenseRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created successfully", expenseService.createExpense(principal.id(), request)));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", expenseService.updateExpense(principal.id(), expenseId, request)));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteExpense(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @PathVariable Long expenseId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", expenseService.deleteExpense(principal.id(), expenseId)));
    }
}