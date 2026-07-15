package demo.server.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import demo.server.dto.internal.OtpVerificationData;
import demo.server.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisServiceImpl implements RedisService {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String OTP_KEY_PREFIX = "otp:";
    private static final String RATE_LIMIT_MIN_PREFIX = "otp:rate:min:";
    private static final String RATE_LIMIT_HOUR_PREFIX = "otp:rate:hour:";

    @Override
    public void saveOtp(String email, OtpVerificationData data, long ttlSeconds) {
        try {
            String json = objectMapper.writeValueAsString(data);
            redisTemplate.opsForValue().set(OTP_KEY_PREFIX + email, json, ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Failed to save OTP to Redis for {}", email, e);
        }
    }

    @Override
    public OtpVerificationData getOtp(String email) {
        try {
            String json = redisTemplate.opsForValue().get(OTP_KEY_PREFIX + email);
            if (json == null) return null;
            return objectMapper.readValue(json, OtpVerificationData.class);
        } catch (Exception e) {
            log.error("Failed to parse OTP from Redis for {}", email, e);
            return null;
        }
    }

    @Override
    public void deleteOtp(String email) {
        redisTemplate.delete(OTP_KEY_PREFIX + email);
    }

    @Override
    public boolean isRateLimitedMin(String email) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(RATE_LIMIT_MIN_PREFIX + email));
    }

    @Override
    public void setRateLimitMin(String email) {
        redisTemplate.opsForValue().set(RATE_LIMIT_MIN_PREFIX + email, "1", 60, TimeUnit.SECONDS);
    }

    @Override
    public int getRateLimitHourCount(String email) {
        String value = redisTemplate.opsForValue().get(RATE_LIMIT_HOUR_PREFIX + email);
        if (value == null) return 0;
        return Integer.parseInt(value);
    }

    @Override
    public void incrementRateLimitHour(String email) {
        String key = RATE_LIMIT_HOUR_PREFIX + email;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, 3600, TimeUnit.SECONDS);
        }
    }
}
