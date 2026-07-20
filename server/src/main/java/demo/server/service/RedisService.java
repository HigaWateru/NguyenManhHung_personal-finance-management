package demo.server.service;

import demo.server.dto.internal.OtpVerificationData;

public interface RedisService {
    void saveOtp(String email, OtpVerificationData data, long ttlSeconds);
    OtpVerificationData getOtp(String email);
    void deleteOtp(String email);
    boolean isRateLimitedMin(String email);
    void setRateLimitMin(String email);
    int getRateLimitHourCount(String email);
    void incrementRateLimitHour(String email);
}
