package demo.server.security.oauth2;

import demo.server.entity.RefreshToken;
import demo.server.entity.User;
import demo.server.common.enums.CurrencyCode;
import demo.server.repository.RefreshTokenRepository;
import demo.server.repository.UserRepository;
import demo.server.security.jwt.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        OAuth2User oauth2User = oauthToken.getPrincipal();

        String email = null;
        String fullName = null;
        String avatarUrl = null;

        if ("google".equalsIgnoreCase(provider)) {
            email = oauth2User.getAttribute("email");
            fullName = oauth2User.getAttribute("name");
            avatarUrl = oauth2User.getAttribute("picture");
        } else if ("github".equalsIgnoreCase(provider)) {
            email = oauth2User.getAttribute("email");
            fullName = oauth2User.getAttribute("name");
            avatarUrl = oauth2User.getAttribute("avatar_url");
            if (fullName == null || fullName.isBlank()) {
                fullName = oauth2User.getAttribute("login");
            }
            if (email == null || email.isBlank()) {
                email = oauth2User.getAttribute("login") + "@github.com";
            }
        }

        if (email == null) {
            throw new ServletException("Email not found from OAuth2 provider");
        }

        String finalEmail = email.trim().toLowerCase();
        final String finalFullName = fullName;
        final String finalAvatarUrl = avatarUrl;
        User user = userRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(finalEmail)
                            .fullName(finalFullName != null ? finalFullName.trim() : "OAuth2 User")
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .avatarUrl(finalAvatarUrl)
                            .timezone("Asia/Ho_Chi_Minh")
                            .currencyCode(CurrencyCode.VND)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });

        String accessToken = jwtTokenProvider.generateAccessToken(user);

        refreshTokenRepository.deleteByRevokedTrueOrExpiresAtBefore(LocalDateTime.now());
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID() + "." + UUID.randomUUID())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                .queryParam("token", accessToken)
                .queryParam("refreshToken", refreshToken.getToken())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
