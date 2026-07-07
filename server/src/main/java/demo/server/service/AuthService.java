package demo.server.service;

import demo.server.dto.request.LoginRequest;
import demo.server.dto.request.RefreshTokenRequest;
import demo.server.dto.request.RegisterRequest;
import demo.server.dto.response.AuthResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.UserProfileResponse;

public interface AuthService {

    UserProfileResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    MessageResponse logout(String refreshToken);

    UserProfileResponse getCurrentUserProfile(Long userId);
}