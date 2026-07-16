package demo.server.service;

import demo.server.dto.request.LoginRequest;
import demo.server.dto.request.ProfileUpdateRequest;
import demo.server.dto.request.RefreshTokenRequest;
import demo.server.dto.request.RegisterRequest;
import demo.server.dto.response.AuthResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import demo.server.dto.request.ForgotPasswordRequest;
import demo.server.dto.request.VerifyOtpRequest;
import demo.server.dto.request.ResetPasswordRequest;

public interface AuthService {
    UserProfileResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    MessageResponse logout(String accessToken, String refreshToken);

    UserProfileResponse getCurrentUserProfile(Long userId);

    UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request);

    UserProfileResponse updateAvatar(Long userId, MultipartFile file);

    void requestForgotPassword(ForgotPasswordRequest request);

    void verifyOtp(VerifyOtpRequest request);

    void resetPassword(String accessToken, ResetPasswordRequest request);

    AuthResponse loginOAuth2(String email, String fullName, String avatarUrl);
}