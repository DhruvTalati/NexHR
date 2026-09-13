package net.javaguides.springboot.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.javaguides.springboot.dto.NotificationResponseDto;
import net.javaguides.springboot.service.NotificationService;

@RestController
@RequestMapping("/api/v1/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    /**
     * Get all notifications for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getMyNotifications(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getMyNotifications(
                        authentication.getName()
                )
        );
    }

    /**
     * Get only unread notifications.
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponseDto>> getMyUnreadNotifications(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getMyUnreadNotifications(
                        authentication.getName()
                )
        );
    }

    /**
     * Get unread notification count.
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getMyUnreadCount(
                        authentication.getName()
                )
        );
    }

    /**
     * Mark one notification as read.
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        notificationService.markAsRead(
                authentication.getName(),
                notificationId
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Mark all notifications as read.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            Authentication authentication) {

        notificationService.markAllAsRead(
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Delete one notification belonging to the logged-in user.
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            Authentication authentication) {

        notificationService.deleteNotification(
                authentication.getName(),
                notificationId
        );

        return ResponseEntity.noContent().build();
    }
}