package demo.server.controller;

import demo.server.dto.request.GoalProgressRequest;
import demo.server.dto.request.GoalRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.GoalResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.entity.Goal;
import demo.server.entity.User;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.ExchangeRateService;
import demo.server.service.GoalService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v2/goals", "/api/v1/goals"})
@RequiredArgsConstructor
public class GoalController {
    private final GoalService goalService;
    private final ExchangeRateService exchangeRateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        List<GoalResponse> responses = goalService.getGoals(principal.getId()).stream()
            .map(this::toResponse)
            .toList();
        return ResponseEntity.ok(ApiResponse.success("Goals fetched successfully", responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody GoalRequest request
    ) {
        Goal goal = goalService.createGoal(principal.getId(), request.getName(), request.getTargetAmount(), request.getTargetDate());
        return ResponseEntity.ok(ApiResponse.success("Goal created successfully", toResponse(goal)));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<GoalResponse>> updateProgress(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody GoalProgressRequest request
    ) {
        Goal goal = goalService.updateGoalProgress(principal.getId(), id, request.getCurrentAmount());
        return ResponseEntity.ok(ApiResponse.success("Goal progress updated successfully", toResponse(goal)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody GoalRequest request,
        @RequestParam(defaultValue = "ACTIVE") String status
    ) {
        Goal goal = goalService.updateGoalDetails(principal.getId(), id, request.getName(), request.getTargetAmount(), request.getTargetDate(), status);
        return ResponseEntity.ok(ApiResponse.success("Goal details updated successfully", toResponse(goal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageResponse>> deleteGoal(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long id
    ) {
        goalService.deleteGoal(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", MessageResponse.builder().message("SUCCESS").build()));
    }

    private GoalResponse toResponse(Goal goal) {
        User user = goal.getUser();
        BigDecimal targetInDisplay = exchangeRateService.convert(goal.getTargetAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        BigDecimal currentInDisplay = exchangeRateService.convert(goal.getCurrentAmount(), user.getCurrencyCode(), user.getDisplayCurrency());
        return GoalResponse.builder()
            .id(goal.getId())
            .name(goal.getName())
            .targetAmount(targetInDisplay)
            .currentAmount(currentInDisplay)
            .targetDate(goal.getTargetDate())
            .status(goal.getStatus())
            .build();
    }
}

