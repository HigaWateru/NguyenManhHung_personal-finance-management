package demo.server.controller;

import demo.server.dto.request.DisplayCurrencyRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.UserProfileResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v2/users", "/api/users", "/api/v1/users"})
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;

    @PutMapping("/display-currency")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateDisplayCurrency(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody DisplayCurrencyRequest request
    ) {
        UserProfileResponse updatedProfile = authService.updateDisplayCurrency(principal.getId(), request.getDisplayCurrency());
        return ResponseEntity.ok(ApiResponse.success("Display currency updated successfully", updatedProfile));
    }
}