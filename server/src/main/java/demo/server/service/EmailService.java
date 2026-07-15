package demo.server.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode, int expiryMinutes);
}
