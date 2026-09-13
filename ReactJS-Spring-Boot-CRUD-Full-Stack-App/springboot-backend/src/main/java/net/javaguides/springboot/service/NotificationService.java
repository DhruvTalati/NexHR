package net.javaguides.springboot.service;

import java.util.List;

import net.javaguides.springboot.dto.NotificationResponseDto;
import net.javaguides.springboot.entity.enums.NotificationType;

public interface NotificationService {

    void createNotification(
            String email,
            NotificationType type,
            String title,
            String message,
            String referenceUrl,
            Long referenceId
    );

    List<NotificationResponseDto> getMyNotifications(
            String email
    );

    List<NotificationResponseDto> getMyUnreadNotifications(
            String email
    );

    long getMyUnreadCount(
            String email
    );

    void markAsRead(
            String email,
            Long notificationId
    );

    void markAllAsRead(
            String email
    );

    void deleteNotification(
            String email,
            Long notificationId
    );
}