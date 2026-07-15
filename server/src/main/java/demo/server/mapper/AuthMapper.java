package demo.server.mapper;

import demo.server.dto.response.UserProfileResponse;
import demo.server.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {
    public UserProfileResponse toUserProfileResponse(User user) {
        return UserProfileResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .avatarUrl(user.getAvatarUrl())
            .timezone(user.getTimezone())
            .currencyCode(user.getCurrencyCode())
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}