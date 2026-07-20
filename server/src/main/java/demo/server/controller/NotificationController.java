package demo.server.controller;

import demo.server.dto.response.ApiResponse;
import demo.server.dto.response.MessageResponse;
import demo.server.entity.Notification;
import demo.server.security.principal.CurrentUserPrincipal;
import demo.server.service.NotificationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v2/notifications", "/api/v1/notifications"})
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @RequestParam(required = false, defaultValue = "false") boolean unreadOnly
    ) {
        List<Notification> notifications;
        if (unreadOnly) notifications = notificationService.getUnreadNotifications(principal.getId());
        else notifications = notificationService.getNotifications(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", notifications));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<MessageResponse>> markAsRead(
        @AuthenticationPrincipal CurrentUserPrincipal principal,
        @PathVariable Long id
    ) {
        notificationService.markAsRead(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", MessageResponse.builder().message("SUCCESS").build()));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<MessageResponse>> markAllAsRead(
        @AuthenticationPrincipal CurrentUserPrincipal principal
    ) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", MessageResponse.builder().message("SUCCESS").build()));
    }
}
