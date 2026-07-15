package demo.server.controller;

import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.StatisticsResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.StatisticsService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStatistics(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @RequestParam(required = false) @Min(value = 2000, message = "Year must be greater than or equal to 2000")
        @Max(value = 2100, message = "Year must be less than or equal to 2100") Integer year
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Statistics fetched successfully", statisticsService.getStatistics(principal.getId(), year))
        );
    }
}