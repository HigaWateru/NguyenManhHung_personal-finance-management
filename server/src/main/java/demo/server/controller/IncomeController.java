package demo.server.controller;

import demo.server.dto.request.IncomeRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.IncomeResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.PageResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.IncomeService;
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
@RequestMapping("/api/v1/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<IncomeResponse>>> getIncomes(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be greater than or equal to 0") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Size must be at least 1") @Max(value = 100, message = "Size must not exceed 100") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Incomes fetched successfully",
                incomeService.getIncomes(principal.getId(), categoryId, fromDate, toDate, keyword, page, size)
        ));
    }

    @GetMapping("/{incomeId}")
    public ResponseEntity<ApiResponse<IncomeResponse>> getIncome(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @PathVariable Long incomeId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Income fetched successfully", incomeService.getIncome(principal.getId(), incomeId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> createIncome(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @Valid @RequestBody IncomeRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Income created successfully", incomeService.createIncome(principal.getId(), request)));
    }

    @PutMapping("/{incomeId}")
    public ResponseEntity<ApiResponse<IncomeResponse>> updateIncome(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @PathVariable Long incomeId,
            @Valid @RequestBody IncomeRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Income updated successfully", incomeService.updateIncome(principal.getId(), incomeId, request)));
    }

    @DeleteMapping("/{incomeId}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteIncome(
            @AuthenticationPrincipal CurrentUserPrincipal principal,
            @PathVariable Long incomeId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Income deleted successfully", incomeService.deleteIncome(principal.getId(), incomeId)));
    }
}