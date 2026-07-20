package demo.server.security.jwt;

import demo.server.entity.User;
import demo.server.repository.UserRepository;
import demo.server.service.JwtBlacklistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterTest {
    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtBlacklistService jwtBlacklistService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void doFilterInternal_noAuthorizationHeader_proceedsChain() throws ServletException, IOException {
        when(request.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn(null);

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    void doFilterInternal_invalidToken_proceedsChainWithoutAuth() throws ServletException, IOException {
        when(request.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer invalid_token");
        when(jwtTokenProvider.isTokenValid("invalid_token")).thenReturn(false);

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(jwtBlacklistService, never()).isBlacklisted(any());
    }

    @Test
    void doFilterInternal_blacklistedToken_returns401() throws ServletException, IOException {
        String token = "blacklisted_token";
        when(request.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer " + token);
        when(jwtTokenProvider.isTokenValid(token)).thenReturn(true);
        when(jwtBlacklistService.isBlacklisted(token)).thenReturn(true);
        when(request.getRequestURI()).thenReturn("/api/v1/some-endpoint");

        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType("application/json;charset=UTF-8");
        verify(filterChain, never()).doFilter(request, response);
        
        String responseContent = stringWriter.toString();
        org.junit.jupiter.api.Assertions.assertTrue(responseContent.contains("Token has been revoked."));
    }

    @Test
    void doFilterInternal_validAndNotBlacklistedToken_authenticatesUser() throws ServletException, IOException {
        String token = "valid_token";
        User user = User.builder()
            .id(1L)
            .email("user@example.com")
            .fullName("User Name")
            .active(true)
            .credentialsUpdatedAt(LocalDateTime.now().minusDays(1))
            .build();

        when(request.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer " + token);
        when(jwtTokenProvider.isTokenValid(token)).thenReturn(true);
        when(jwtBlacklistService.isBlacklisted(token)).thenReturn(false);
        when(jwtTokenProvider.extractUserId(token)).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(jwtTokenProvider.extractIssuedAt(token)).thenReturn(new Date());

        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }
}