package demo.server.service;

import demo.server.dto.internal.OtpVerificationData;
import demo.server.dto.request.ForgotPasswordRequest;
import demo.server.dto.request.VerifyOtpRequest;
import demo.server.dto.request.ResetPasswordRequest;
import demo.server.entity.User;
import demo.server.exception.ApiException;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceForgotPasswordTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RedisService redisService;

    @Mock
    private EmailService emailService;

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
    void requestForgotPassword_rateLimitMin_throwsException() {
        ForgotPasswordRequest request = ForgotPasswordRequest.builder().email("test@example.com").build();
        when(redisService.isRateLimitedMin("test@example.com")).thenReturn(true);

        assertThrows(ApiException.class, () -> authService.requestForgotPassword(request));
        verify(redisService, never()).saveOtp(anyString(), any(), anyLong());
    }

    @Test
    void requestForgotPassword_success_sendsEmail() {
        ForgotPasswordRequest request = ForgotPasswordRequest.builder().email("test@example.com").build();
        when(redisService.isRateLimitedMin("test@example.com")).thenReturn(false);
        when(redisService.getRateLimitHourCount("test@example.com")).thenReturn(0);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_otp");

        authService.requestForgotPassword(request);

        verify(redisService).setRateLimitMin("test@example.com");
        verify(redisService).incrementRateLimitHour("test@example.com");
        verify(redisService).saveOtp(eq("test@example.com"), any(OtpVerificationData.class), eq(300L));
        verify(emailService).sendOtpEmail(eq("test@example.com"), anyString(), eq(5));
    }

    @Test
    void verifyOtp_otpNotFound_throwsException() {
        VerifyOtpRequest request = VerifyOtpRequest.builder().email("test@example.com").otp("123456").build();
        when(redisService.getOtp("test@example.com")).thenReturn(null);

        assertThrows(ApiException.class, () -> authService.verifyOtp(request));
    }

    @Test
    void verifyOtp_success_marksVerified() {
        VerifyOtpRequest request = VerifyOtpRequest.builder().email("test@example.com").otp("123456").build();
        OtpVerificationData data = OtpVerificationData.builder().hashedOtp("hashed_otp").attempts(0).verified(false).build();
        when(redisService.getOtp("test@example.com")).thenReturn(data);
        when(passwordEncoder.matches("123456", "hashed_otp")).thenReturn(true);

        authService.verifyOtp(request);

        assertTrue(data.isVerified());
        verify(redisService).saveOtp("test@example.com", data, 300L);
    }

    @Test
    void resetPassword_mismatchedPassword_throwsException() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .email("test@example.com")
                .otp("123456")
                .password("NewPass123!")
                .confirmPassword("DiffPass123!")
                .build();

        assertThrows(ApiException.class, () -> authService.resetPassword(null, request));
    }
}
