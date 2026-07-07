package demo.server.mapper;

import demo.server.dto.response.UserProfileResponse;
import demo.server.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {
    public UserProfileResponse toUserProfileResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getAvatarUrl(),
            user.getTimezone(),
            user.getCurrencyCode(),
            user.isActive(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}