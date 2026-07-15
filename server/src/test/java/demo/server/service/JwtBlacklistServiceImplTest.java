package demo.server.service;

import demo.server.security.jwt.JwtTokenProvider;
import demo.server.service.impl.JwtBlacklistServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Date;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtBlacklistServiceImplTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private JwtBlacklistServiceImpl jwtBlacklistService;

    @Test
    void blacklistToken_validToken_savesToRedis() {
        String token = "valid_token";
        Date futureDate = new Date(System.currentTimeMillis() + 60000); // 1 minute in the future
        
        when(jwtTokenProvider.extractExpiration(token)).thenReturn(futureDate);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        jwtBlacklistService.blacklistToken(token);

        verify(valueOperations).set(
                eq("jwt:blacklist:" + token),
                eq("logout"),
                anyLong(),
                eq(TimeUnit.MILLISECONDS)
        );
    }

    @Test
    void blacklistToken_expiredToken_doesNotSaveToRedis() {
        String token = "expired_token";
        Date pastDate = new Date(System.currentTimeMillis() - 60000); // 1 minute in the past

        when(jwtTokenProvider.extractExpiration(token)).thenReturn(pastDate);

        jwtBlacklistService.blacklistToken(token);

        verify(redisTemplate, never()).opsForValue();
    }

    @Test
    void isBlacklisted_tokenExists_returnsTrue() {
        String token = "blacklisted_token";
        when(redisTemplate.hasKey("jwt:blacklist:" + token)).thenReturn(true);

        assertTrue(jwtBlacklistService.isBlacklisted(token));
    }

    @Test
    void isBlacklisted_tokenDoesNotExist_returnsFalse() {
        String token = "clean_token";
        when(redisTemplate.hasKey("jwt:blacklist:" + token)).thenReturn(false);

        assertFalse(jwtBlacklistService.isBlacklisted(token));
    }

    @Test
    void isBlacklisted_nullOrEmptyToken_returnsFalse() {
        assertFalse(jwtBlacklistService.isBlacklisted(null));
        assertFalse(jwtBlacklistService.isBlacklisted("   "));
    }
}
