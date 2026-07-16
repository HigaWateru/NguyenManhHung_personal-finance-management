package demo.server.service;

import demo.server.entity.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotifications(Long userId);
    List<Notification> getUnreadNotifications(Long userId);
    Notification createNotification(Long userId, String title, String message, String type);
    void markAsRead(Long userId, Long notificationId);
    void markAllAsRead(Long userId);
}
