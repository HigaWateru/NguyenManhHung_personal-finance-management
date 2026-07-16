package demo.server.security.oauth2;

import demo.server.dto.response.AuthResponse;
import demo.server.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final AuthService authService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) return;

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

            if (fullName == null || fullName.isBlank()) fullName = oauth2User.getAttribute("login");
            if (email == null || email.isBlank()) email = oauth2User.getAttribute("login") + "@github.com";
        }

        if (email == null) throw new ServletException("Email not found from OAuth2 provider");

        AuthResponse authResponse = authService.loginOAuth2(email, fullName, avatarUrl);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
            .queryParam("token", authResponse.getAccessToken())
            .queryParam("refreshToken", authResponse.getRefreshToken())
            .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
