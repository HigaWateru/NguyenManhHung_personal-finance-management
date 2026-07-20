package demo.server.repository;

import demo.server.entity.RefreshToken;
import demo.server.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUserAndRevokedFalse(User user);
    long deleteByUser(User user);
    long deleteByRevokedTrueOrExpiresAtBefore(LocalDateTime expiresAt);
}