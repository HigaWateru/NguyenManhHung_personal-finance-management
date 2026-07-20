package demo.server.security.jwt;

import demo.server.entity.User;
import demo.server.dto.response.ApiResponse;
import demo.server.repository.UserRepository;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.JwtBlacklistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final JwtBlacklistService jwtBlacklistService;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);
        if (!jwtTokenProvider.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (jwtBlacklistService.isBlacklisted(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            ApiResponse<Void> apiResponse = ApiResponse.failure("Token has been revoked.", null, request.getRequestURI());
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
            return;
        }

        Long userId = jwtTokenProvider.extractUserId(token);
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        User user = userOptional.get();
        if (!user.isActive() || SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        java.util.Date issuedAt = jwtTokenProvider.extractIssuedAt(token);
        if (user.getCredentialsUpdatedAt() != null && issuedAt.before(java.sql.Timestamp.valueOf(user.getCredentialsUpdatedAt()))) {
            filterChain.doFilter(request, response);
            return;
        }

        CurrentUserPrincipal principal = CurrentUserPrincipal.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .active(user.isActive())
            .build();

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            principal,
            null,
            Collections.emptyList());
        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        filterChain.doFilter(request, response);
    }
}