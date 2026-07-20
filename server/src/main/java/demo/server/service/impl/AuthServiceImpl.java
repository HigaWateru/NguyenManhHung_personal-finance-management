package demo.server.service.impl;

import demo.server.common.enums.CurrencyCode;
import demo.server.common.enums.CategoryType;
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
import demo.server.entity.Category;
import demo.server.entity.Income;
import demo.server.entity.Expense;
import demo.server.entity.RefreshToken;
import demo.server.entity.User;
import demo.server.entity.Budget;
import demo.server.entity.Goal;
import demo.server.exception.ApiException;
import demo.server.mapper.AuthMapper;
import demo.server.repository.CategoryRepository;
import demo.server.repository.IncomeRepository;
import demo.server.repository.ExpenseRepository;
import demo.server.repository.BudgetRepository;
import demo.server.repository.GoalRepository;
import demo.server.repository.TransactionRepository;
import demo.server.repository.RefreshTokenRepository;
import demo.server.repository.UserRepository;
import demo.server.security.jwt.JwtTokenProvider;
import demo.server.service.AuthService;
import demo.server.service.ExchangeRateService;
import demo.server.service.CloudinaryService;
import demo.server.service.RedisService;
import demo.server.service.EmailService;
import demo.server.service.JwtBlacklistService;
import java.math.BigDecimal;
import java.time.LocalDate;
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
    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;
    private final ExchangeRateService exchangeRateService;
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
        seedDemoData(savedUser);
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

        CurrencyCode oldCurrency = user.getCurrencyCode();
        CurrencyCode newCurrency = request.getCurrencyCode();

        if (oldCurrency != newCurrency) {
            // Convert existing data in database to new base currency
            
            // 1. Incomes
            List<Income> incomes = incomeRepository.findAllByUserId(userId);
            for (Income inc : incomes) {
                BigDecimal converted = exchangeRateService.convert(inc.getAmount(), oldCurrency, newCurrency);
                inc.updateDetails(inc.getCategory(), converted, inc.getTransactionDate(), inc.getNote());
            }
            incomeRepository.saveAll(incomes);

            // 2. Expenses
            List<Expense> expenses = expenseRepository.findAllByUserId(userId);
            for (Expense exp : expenses) {
                BigDecimal converted = exchangeRateService.convert(exp.getAmount(), oldCurrency, newCurrency);
                exp.updateDetails(exp.getCategory(), converted, exp.getTransactionDate(), exp.getNote());
            }
            expenseRepository.saveAll(expenses);

            // 3. Budgets
            List<Budget> budgets = budgetRepository.findByUserId(userId);
            for (Budget b : budgets) {
                BigDecimal converted = exchangeRateService.convert(b.getLimitAmount(), oldCurrency, newCurrency);
                b.updateLimit(converted);
            }
            budgetRepository.saveAll(budgets);

            // 4. Goals
            List<Goal> goals = goalRepository.findByUserId(userId);
            for (Goal g : goals) {
                BigDecimal convertedTarget = exchangeRateService.convert(g.getTargetAmount(), oldCurrency, newCurrency);
                BigDecimal convertedCurrent = exchangeRateService.convert(g.getCurrentAmount(), oldCurrency, newCurrency);
                g.updateDetails(g.getName(), convertedTarget, g.getTargetDate(), g.getStatus());
                g.updateProgress(convertedCurrent);
            }
            goalRepository.saveAll(goals);

            // 5. Transactions (Plaid)
            List<demo.server.entity.Transaction> txs = transactionRepository.findByUserId(userId);
            for (demo.server.entity.Transaction tx : txs) {
                BigDecimal converted = exchangeRateService.convert(tx.getAmount(), oldCurrency, newCurrency);
                tx.updateAmount(converted);
            }
            transactionRepository.saveAll(txs);
        }

        user.updateProfile(request.getFullName().trim(), request.getTimezone().trim(), request.getCurrencyCode());
        User savedUser = userRepository.save(user);
        return authMapper.toUserProfileResponse(savedUser);
    }


    @Override
    @Transactional
    public UserProfileResponse updateDisplayCurrency(Long userId, CurrencyCode displayCurrency) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> ApiException.notFound("User not found"));

        user.updateDisplayCurrency(displayCurrency);
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
        if (refreshToken.isRevoked()) throw ApiException.unauthorized("Refresh token has been revoked");

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            revokeRefreshToken(refreshToken);
            throw ApiException.unauthorized("Refresh token has expired");
        }

        if (!refreshToken.getUser().isActive()) throw ApiException.unauthorized("User account is inactive");
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
        } else log.warn("Forgot password request for non-existent or inactive email: {}", email);
    }

    @Override
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otp = request.getOtp();
        log.info("OTP verification attempt for email: {}", email);

        OtpVerificationData data = redisService.getOtp(email);
        if (data == null) throw ApiException.badRequest("Mã OTP đã hết hạn hoặc không tồn tại.");
        if (data.isVerified()) throw ApiException.badRequest("Mã OTP đã được sử dụng.");

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

        if (!user.isActive()) throw ApiException.badRequest("Tài khoản đang bị khóa.");

        user.updatePassword(passwordEncoder.encode(request.getPassword()));
        user.updateCredentialsUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserAndRevokedFalse(user);
        for (RefreshToken token : activeTokens) {
            token.revoke(LocalDateTime.now());
        }
        refreshTokenRepository.saveAll(activeTokens);

        if (accessToken != null) jwtBlacklistService.blacklistToken(accessToken);

        redisService.deleteOtp(email);
        log.info("Password reset successful and all sessions revoked for email: {}", email);
    }

    private String generateRefreshTokenValue() {
        return UUID.randomUUID() + "." + UUID.randomUUID();
    }

    @Override
    @Transactional
    public AuthResponse loginOAuth2(String email, String fullName, String avatarUrl) {
        String finalEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(finalEmail)
            .orElseGet(() -> {
                User newUser = User.builder()
                    .email(finalEmail)
                    .fullName(fullName != null ? fullName.trim() : "OAuth2 User")
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .avatarUrl(avatarUrl)
                    .timezone(DEFAULT_TIMEZONE)
                    .currencyCode(CurrencyCode.VND)
                    .active(true)
                    .build();
                User savedNewUser = userRepository.save(newUser);
                seedDemoData(savedNewUser);
                return savedNewUser;
            });

        if (!user.isActive()) throw ApiException.unauthorized("Tài khoản đang bị khóa.");

        RefreshToken refreshToken = createRefreshToken(user);
        return buildAuthResponse(user, refreshToken.getToken());
    }

    private void seedDemoData(User user) {
        // Define default categories
        Category salary = Category.builder().user(user).name("Salary").type(CategoryType.INCOME).description("Lương hàng tháng").build();
        Category bonus = Category.builder().user(user).name("Bonus").type(CategoryType.INCOME).description("Thưởng hiệu suất").build();
        Category freelance = Category.builder().user(user).name("Freelance").type(CategoryType.INCOME).description("Thu nhập ngoài").build();
        
        Category food = Category.builder().user(user).name("Food").type(CategoryType.EXPENSE).description("Chi phí ăn uống").build();
        Category transport = Category.builder().user(user).name("Transport").type(CategoryType.EXPENSE).description("Chi phí đi lại").build();
        Category shopping = Category.builder().user(user).name("Shopping").type(CategoryType.EXPENSE).description("Mua sắm cá nhân").build();
        Category entertainment = Category.builder().user(user).name("Entertainment").type(CategoryType.EXPENSE).description("Giải trí").build();
        Category health = Category.builder().user(user).name("Health").type(CategoryType.EXPENSE).description("Y tế sức khỏe").build();
        Category utilities = Category.builder().user(user).name("Utilities").type(CategoryType.EXPENSE).description("Điện nước internet").build();

        categoryRepository.saveAll(List.of(salary, bonus, freelance, food, transport, shopping, entertainment, health, utilities));
    }
}