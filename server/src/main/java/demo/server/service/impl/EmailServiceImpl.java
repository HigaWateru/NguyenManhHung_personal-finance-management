package demo.server.service.impl;

import demo.server.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, int expiryMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("smartfinance.demo@gmail.com", "Smart Finance");
            helper.setTo(toEmail);
            helper.setSubject("[Smart Finance] Mã xác thực OTP đặt lại mật khẩu");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0f172a; color: #f8fafc;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #22d3ee; margin: 0; font-size: 28px; font-weight: bold;">Smart Finance</h2>
                    </div>
                    <div style="background-color: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155;">
                        <h3 style="color: #f8fafc; margin-top: 0; font-size: 18px;">Đặt lại mật khẩu tài khoản</h3>
                        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Smart Finance của bạn. Sử dụng mã OTP bên dưới để xác thực:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #22d3ee; letter-spacing: 5px; padding: 10px 20px; background-color: #0f172a; border: 1px solid #334155; border-radius: 8px;">%s</span>
                        </div>
                        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                            Mã OTP này có hiệu lực trong vòng <strong>%d phút</strong>. Mỗi tài khoản chỉ có một mã OTP còn hiệu lực.
                        </p>
                        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #334155; padding-top: 15px;">
                            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
                        </p>
                    </div>
                </div>
                """.formatted(otpCode, expiryMinutes);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Successfully sent OTP email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Gửi email thất bại. Vui lòng thử lại sau.");
        }
    }
}
