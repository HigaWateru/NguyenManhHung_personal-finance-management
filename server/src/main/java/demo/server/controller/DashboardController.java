package demo.server.controller;

import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.DashboardResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        return ResponseEntity.ok(
            ApiResponse.success("Dashboard fetched successfully", dashboardService.getDashboard(principal.getId()))
        );
    }
}