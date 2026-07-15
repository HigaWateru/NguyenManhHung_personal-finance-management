package demo.server.service.impl;

import demo.server.common.enums.CurrencyCode;
import demo.server.dto.internal.OtpVerificationData;
import demo.server.dto.request.LoginRequest;
import demo.server.dto.request.ProfileUpdateRequest;
import demo.server.dto.request.RefreshTokenRequest;
import demo.server.dto.request.RegisterRequest;
import demo.server.dto.request.ForgotPasswordRequest;
import demo.server.dto.request.VerifyOtpRequest;
import demo.server.dto.request.ResetPasswordRequest;
import demo.server.dto.response.AuthResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.dto.response.UserProfileResponse;
import demo.server.entity.RefreshToken;
import demo.server.entity.User;
import demo.server.exception.ApiException;
import demo.server.mapper.AuthMapper;
import demo.server.repository.RefreshTokenRepository;
import demo.server.repository.UserRepository;
import demo.server.security.jwt.JwtTokenProvider;
import demo.server.service.AuthService;
import demo.server.service.CloudinaryService;
import demo.server.service.RedisService;
import demo.server.service.EmailService;
import demo.server.service.JwtBlacklistService;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Locale;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private static final String DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthMapper authMapper;
    private final CloudinaryService cloudinaryService;
    private final RedisService redisService;
    private final EmailService emailService;
    private final JwtBlacklistService jwtBlacklistService;

    @Value("${jwt.refresh-token-days}")
    private long refreshTokenDays;

    @Override
    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) throw ApiException.conflict("Email already exists");

        User user = User.builder()
            .fullName(request.getFullName().trim())
            .email(normalizedEmail)
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .timezone(resolveTimezone(request.getTimezone()))
            .currencyCode(request.getCurrencyCode() != null ? request.getCurrencyCode() : CurrencyCode.VND)
            .active(true)
            .build();

        User savedUser = userRepository.save(user);
        return authMapper.toUserProfileResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!user.isActive() || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        RefreshToken refreshToken = createRefreshToken(user);
        return buildAuthResponse(user, refreshToken.getToken());
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> ApiException.unauthorized("Refresh token is invalid"));

        validateRefreshToken(refreshToken);
        revokeRefreshToken(refreshToken);

        User user = refreshToken.getUser();
        RefreshToken newRefreshToken = createRefreshToken(user);
        return buildAuthResponse(user, newRefreshToken.getToken());
    }

    @Override
    @Transactional
    public MessageResponse logout(String accessToken, String refreshTokenValue) {
        if (accessToken != null) {
            jwtBlacklistService.blacklistToken(accessToken);
        }

        refreshTokenRepository.findByToken(refreshTokenValue)
            .ifPresent(token -> {
                if (!token.isRevoked()) revokeRefreshToken(token);
            });

        return MessageResponse.builder().message("Logout successful").build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return authMapper.toUserProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        user.updateProfile(request.getFullName().trim(), request.getTimezone().trim(), request.getCurrencyCode());
        User savedUser = userRepository.save(user);
        return authMapper.toUserProfileResponse(savedUser);
    }

    @Override
    @Transactional
    public UserProfileResponse updateAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (file == null || file.isEmpty()) throw ApiException.badRequest("File must not be empty");

        String avatarUrl = cloudinaryService.uploadFile(file, "avatars");

        user.updateAvatarUrl(avatarUrl);
        User savedUser = userRepository.save(user);
        return authMapper.toUserProfileResponse(savedUser);
    }

    private AuthResponse buildAuthResponse(User user, String refreshToken) {
        return AuthResponse.builder()
            .accessToken(jwtTokenProvider.generateAccessToken(user))
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getAccessTokenExpirySeconds())
            .user(authMapper.toUserProfileResponse(user))
            .build();
    }

    private RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByRevokedTrueOrExpiresAtBefore(LocalDateTime.now());

        RefreshToken refreshToken = RefreshToken.builder()
            .user(user)
            .token(generateRefreshTokenValue())
            .expiresAt(LocalDateTime.now().plusDays(refreshTokenDays))
            .revoked(false)
            .build();
        return refreshTokenRepository.save(refreshToken);
    }

    private void validateRefreshToken(RefreshToken refreshToken) {
        if (refreshToken.isRevoked()) {
            throw ApiException.unauthorized("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            revokeRefreshToken(refreshToken);
            throw ApiException.unauthorized("Refresh token has expired");
        }

        if (!refreshToken.getUser().isActive()) {
            throw ApiException.unauthorized("User account is inactive");
        }
    }

    private void revokeRefreshToken(RefreshToken refreshToken) {
        refreshToken.revoke(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String resolveTimezone(String timezone) {
        if (timezone == null || timezone.isBlank()) return DEFAULT_TIMEZONE;
        return timezone.trim();
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(900000) + 100000;
        return String.valueOf(num);
    }

    @Override
    @Transactional
    public void requestForgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        log.info("Forgot password request initiated for email: {}", email);

        if (redisService.isRateLimitedMin(email)) {
            throw ApiException.badRequest("Yêu cầu gửi OTP quá nhanh. Vui lòng đợi 1 phút.");
        }
        if (redisService.getRateLimitHourCount(email) >= 5) {
            throw ApiException.badRequest("Vượt quá giới hạn gửi OTP (tối đa 5 lần/giờ). Vui lòng thử lại sau.");
        }

        redisService.setRateLimitMin(email);
        redisService.incrementRateLimitHour(email);

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent() && userOptional.get().isActive()) {
            String otp = generateOtp();
            String hashedOtp = passwordEncoder.encode(otp);

            OtpVerificationData data = OtpVerificationData.builder()
                    .hashedOtp(hashedOtp)
                    .attempts(0)
                    .verified(false)
                    .build();
            redisService.saveOtp(email, data, 300);

            emailService.sendOtpEmail(email, otp, 5);
        } else {
            log.warn("Forgot password request for non-existent or inactive email: {}", email);
        }
    }

    @Override
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otp = request.getOtp();
        log.info("OTP verification attempt for email: {}", email);

        OtpVerificationData data = redisService.getOtp(email);
        if (data == null) {
            throw ApiException.badRequest("Mã OTP đã hết hạn hoặc không tồn tại.");
        }

        if (data.isVerified()) {
            throw ApiException.badRequest("Mã OTP đã được sử dụng.");
        }

        if (!passwordEncoder.matches(otp, data.getHashedOtp())) {
            int attempts = data.getAttempts() + 1;
            log.warn("Incorrect OTP attempt #{} for email: {}", attempts, email);
            if (attempts >= 5) {
                redisService.deleteOtp(email);
                throw ApiException.badRequest("Nhập sai mã OTP quá 5 lần. Mã OTP đã bị hủy.");
            } else {
                data.setAttempts(attempts);
                redisService.saveOtp(email, data, 300);
                throw ApiException.badRequest("Mã OTP không hợp lệ. Bạn còn " + (5 - attempts) + " lần thử.");
            }
        }

        data.setVerified(true);
        redisService.saveOtp(email, data, 300);
        log.info("OTP verification successful for email: {}", email);
    }

    @Override
    @Transactional
    public void resetPassword(String accessToken, ResetPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otp = request.getOtp();
        log.info("Password reset initiated for email: {}", email);

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw ApiException.badRequest("Mật khẩu xác nhận không khớp.");
        }

        OtpVerificationData data = redisService.getOtp(email);
        if (data == null || !data.isVerified() || !passwordEncoder.matches(otp, data.getHashedOtp())) {
            throw ApiException.badRequest("Yêu cầu không hợp lệ. Vui lòng xác thực OTP trước.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("Tài khoản không tồn tại."));

        if (!user.isActive()) {
            throw ApiException.badRequest("Tài khoản đang bị khóa.");
        }

        user.updatePassword(passwordEncoder.encode(request.getPassword()));
        user.updateCredentialsUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserAndRevokedFalse(user);
        for (RefreshToken token : activeTokens) {
            token.revoke(LocalDateTime.now());
        }
        refreshTokenRepository.saveAll(activeTokens);

        if (accessToken != null) {
            jwtBlacklistService.blacklistToken(accessToken);
        }

        redisService.deleteOtp(email);
        log.info("Password reset successful and all sessions revoked for email: {}", email);
    }

    private String generateRefreshTokenValue() {
        return UUID.randomUUID() + "." + UUID.randomUUID();
    }
}