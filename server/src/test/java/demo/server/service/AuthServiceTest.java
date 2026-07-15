package demo.server.service;

import demo.server.dto.request.ResetPasswordRequest;
import demo.server.dto.internal.OtpVerificationData;
import demo.server.entity.RefreshToken;
import demo.server.entity.User;
import demo.server.repository.RefreshTokenRepository;
import demo.server.repository.UserRepository;
import demo.server.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtBlacklistService jwtBlacklistService;

    @Mock
    private RedisService redisService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .passwordHash("hashed")
                .timezone("UTC")
                .active(true)
                .build();
    }

    @Test
    void logout_validToken_blacklistsAccessTokenAndRevokesRefreshToken() {
        String accessToken = "valid_access_token";
        String refreshTokenVal = "valid_refresh_token";
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenVal)
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken(refreshTokenVal)).thenReturn(Optional.of(refreshToken));

        authService.logout(accessToken, refreshTokenVal);

        verify(jwtBlacklistService).blacklistToken(accessToken);
        verify(refreshTokenRepository).save(refreshToken);
        assertTrue(refreshToken.isRevoked());
    }

    @Test
    void resetPassword_validRequest_blacklistsAccessToken() {
        String accessToken = "valid_access_token";
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("test@example.com")
                .otp("123456")
                .password("NewPass123!")
                .confirmPassword("NewPass123!")
                .build();

        OtpVerificationData otpData = OtpVerificationData.builder()
                .hashedOtp("hashed_otp")
                .attempts(0)
                .verified(true)
                .build();

        when(redisService.getOtp("test@example.com")).thenReturn(otpData);
        when(passwordEncoder.matches("123456", "hashed_otp")).thenReturn(true);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("NewPass123!")).thenReturn("new_hashed_password");
        when(refreshTokenRepository.findByUserAndRevokedFalse(testUser)).thenReturn(Collections.emptyList());

        authService.resetPassword(accessToken, request);

        verify(jwtBlacklistService).blacklistToken(accessToken);
        verify(userRepository).save(testUser);
        verify(redisService).deleteOtp("test@example.com");
    }
}
