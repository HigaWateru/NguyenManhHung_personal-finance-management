package demo.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import demo.server.dto.request.LoginRequest;
import demo.server.dto.request.LogoutRequest;
import demo.server.entity.User;
import demo.server.repository.UserRepository;
import demo.server.repository.CategoryRepository;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.RefreshTokenRepository;
import demo.server.service.JwtBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class JwtBlacklistIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private JwtBlacklistService jwtBlacklistService;

    private User testUser;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        expenseRepository.deleteAll();
        incomeRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
        testUser = User.builder()
                .email("integration@example.com")
                .fullName("Integration User")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .active(true)
                .timezone("Asia/Ho_Chi_Minh")
                .currencyCode(demo.server.common.enums.CurrencyCode.VND)
                .build();
        userRepository.save(testUser);
    }

    @Test
    void testLoginLogoutAndRevokedToken() throws Exception {
        // 1. Perform Login
        LoginRequest loginRequest = LoginRequest.builder()
                .email("integration@example.com")
                .password("Password123!")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.refreshToken").exists())
                .andReturn();

        String responseContent = loginResult.getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(responseContent).path("data").path("accessToken").asText();
        String refreshToken = objectMapper.readTree(responseContent).path("data").path("refreshToken").asText();

        // 2. Call profile endpoint using the obtained accessToken (Success)
        when(jwtBlacklistService.isBlacklisted(accessToken)).thenReturn(false);

        mockMvc.perform(get("/api/v1/auth/profile")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("integration@example.com"));

        // 3. Perform Logout
        LogoutRequest logoutRequest = LogoutRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/v1/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logout successful"));

        // Verify that the logout request attempted to blacklist the accessToken
        verify(jwtBlacklistService, times(1)).blacklistToken(accessToken);

        // 4. Call profile endpoint again using the blacklisted accessToken (Denied with 401 and custom message)
        when(jwtBlacklistService.isBlacklisted(accessToken)).thenReturn(true);

        mockMvc.perform(get("/api/v1/auth/profile")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Token has been revoked."));
    }
}
