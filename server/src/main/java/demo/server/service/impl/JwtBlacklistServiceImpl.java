package demo.server.service.impl;

import demo.server.security.jwt.JwtTokenProvider;
import demo.server.service.JwtBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtBlacklistServiceImpl implements JwtBlacklistService {

    private final StringRedisTemplate redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String BLACKLIST_KEY_PREFIX = "jwt:blacklist:";
    private static final String BLACKLIST_VALUE = "logout";

    @Override
    public void blacklistToken(String token) {
        if (token == null || token.isBlank()) {
            log.warn("Attempted to blacklist an empty or null token");
            return;
        }

        try {
            Date expiration = jwtTokenProvider.extractExpiration(token);
            long remainingMillis = expiration.getTime() - System.currentTimeMillis();

            if (remainingMillis > 0) {
                String key = BLACKLIST_KEY_PREFIX + token;
                redisTemplate.opsForValue().set(key, BLACKLIST_VALUE, remainingMillis, TimeUnit.MILLISECONDS);
                log.info("Successfully blacklisted token with key: {}. TTL: {} ms", key, remainingMillis);
            } else {
                log.debug("Token is already expired, no need to blacklist. Remaining time: {} ms", remainingMillis);
            }
        } catch (Exception e) {
            log.error("Failed to blacklist JWT token: {}", e.getMessage(), e);
        }
    }

    @Override
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) return false;
        try {
            String key = BLACKLIST_KEY_PREFIX + token;
            Boolean hasKey = redisTemplate.hasKey(key);
            boolean blacklisted = Boolean.TRUE.equals(hasKey);
            if (blacklisted) log.warn("Blacklisted token check returned true for key: {}", key);
            return blacklisted;
        } catch (Exception e) {
            log.error("Redis connection failure when checking blacklist: {}", e.getMessage());
            return false;
        }
    }
}