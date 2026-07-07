package demo.server.security.principal;

public record CurrentUserPrincipal(
        Long id,
        String email,
        String fullName,
        boolean active
) {
}