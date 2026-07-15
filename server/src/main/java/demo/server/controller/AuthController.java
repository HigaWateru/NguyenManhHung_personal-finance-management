package demo.server.controller;

import demo.server.dto.request.LoginRequest;
import demo.server.dto.request.LogoutRequest;
import demo.server.dto.request.ProfileUpdateRequest;
import demo.server.dto.request.RefreshTokenRequest;
import demo.server.dto.request.RegisterRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.AuthResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.UserProfileResponse;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.multipart.MultipartFile;

import demo.server.dto.request.ForgotPasswordRequest;
import demo.server.dto.request.VerifyOtpRequest;
import demo.server.dto.request.ResetPasswordRequest;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserProfileResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Register successful", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Refresh token successful", authService.refreshToken(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<MessageResponse>> logout(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
        @Valid @RequestBody LogoutRequest request
    ) {
        String accessToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }
        return ResponseEntity.ok(ApiResponse.success("Logout successful", authService.logout(accessToken, request.getRefreshToken())));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", authService.getCurrentUserProfile(principal.getId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @Valid @RequestBody ProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", authService.updateProfile(principal.getId(), request)));
    }

    @PostMapping(value = "/profile/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAvatar(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success("Avatar updated successfully", authService.updateAvatar(principal.getId(), file)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<MessageResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestForgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
            "Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến email của bạn.",
            MessageResponse.builder().message("Mã OTP đã được gửi thành công.").build()
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<MessageResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(
            "Mã OTP hợp lệ.",
            MessageResponse.builder().message("Xác thực OTP thành công.").build()
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<MessageResponse>> resetPassword(
        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
        @Valid @RequestBody ResetPasswordRequest request
    ) {
        String accessToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }
        authService.resetPassword(accessToken, request);
        return ResponseEntity.ok(ApiResponse.success(
            "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
            MessageResponse.builder().message("Đặt lại mật khẩu thành công.").build()
        ));
    }
}