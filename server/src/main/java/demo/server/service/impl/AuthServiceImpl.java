package demo.server.service.impl;

import demo.server.common.enums.CurrencyCode;
import demo.server.dto.request.LoginRequest;
import demo.server.dto.request.RefreshTokenRequest;
import demo.server.dto.request.RegisterRequest;
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
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthMapper authMapper;

    @Value("${jwt.refresh-token-days}")
    private long refreshTokenDays;

    @Override
    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ApiException.conflict("Email already exists");
        }

        User user = User.builder()
            .fullName(request.fullName().trim())
            .email(normalizedEmail)
            .passwordHash(passwordEncoder.encode(request.password()))
            .timezone(resolveTimezone(request.timezone()))
            .currencyCode(request.currencyCode() != null ? request.currencyCode() : CurrencyCode.VND)
            .active(true)
            .build();

        User savedUser = userRepository.save(user);
        return authMapper.toUserProfileResponse(savedUser);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!user.isActive() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        RefreshToken refreshToken = createRefreshToken(user);
        return buildAuthResponse(user, refreshToken.getToken());
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> ApiException.unauthorized("Refresh token is invalid"));

        validateRefreshToken(refreshToken);
        revokeRefreshToken(refreshToken);

        User user = refreshToken.getUser();
        RefreshToken newRefreshToken = createRefreshToken(user);
        return buildAuthResponse(user, newRefreshToken.getToken());
    }

    @Override
    @Transactional
    public MessageResponse logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(token -> {
                    if (!token.isRevoked()) {
                        revokeRefreshToken(token);
                    }
                });

        return new MessageResponse("Logout successful");
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return authMapper.toUserProfileResponse(user);
    }

    private AuthResponse buildAuthResponse(User user, String refreshToken) {
        return new AuthResponse(
                jwtTokenProvider.generateAccessToken(user),
                refreshToken,
                "Bearer",
                jwtTokenProvider.getAccessTokenExpirySeconds(),
                authMapper.toUserProfileResponse(user)
        );
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
        if (timezone == null || timezone.isBlank()) {
            return DEFAULT_TIMEZONE;
        }
        return timezone.trim();
    }

    private String generateRefreshTokenValue() {
        return UUID.randomUUID() + "." + UUID.randomUUID();
    }
}