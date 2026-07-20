package demo.server.controller;

import demo.server.dto.request.ForgotPasswordRequest;
import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.doNothing;

@ExtendWith(MockitoExtension.class)
public class AuthControllerForgotPasswordIntegrationTest {
    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void forgotPassword_validRequest_returnsOk() {
        ForgotPasswordRequest request = ForgotPasswordRequest.builder()
            .email("test@example.com")
            .build();

        doNothing().when(authService).requestForgotPassword(request);

        ResponseEntity<ApiResponse<MessageResponse>> responseEntity = authController.forgotPassword(request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(true, responseEntity.getBody().isSuccess());
        assertEquals("Nếu email tồn tại trong hệ thống, mã OTP đã được gửi đến email của bạn.", responseEntity.getBody().getMessage());
    }
}
