package net.javaguides.springboot.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.javaguides.springboot.dto.NotificationResponseDto;
import net.javaguides.springboot.entity.Notification;
import net.javaguides.springboot.entity.User;
import net.javaguides.springboot.entity.enums.NotificationType;
import net.javaguides.springboot.exception.UserNotFoundException;
import net.javaguides.springboot.mapper.NotificationMapper;
import net.javaguides.springboot.repository.NotificationRepository;
import net.javaguides.springboot.repository.UserRepository;
import net.javaguides.springboot.service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl
        implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationMapper notificationMapper) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    public void createNotification(
            String email,
            NotificationType type,
            String title,
            String message,
            String referenceUrl,
            Long referenceId) {

        User user = findUserByEmail(email);

        Notification notification =
                new Notification();

        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceUrl(referenceUrl);
        notification.setReferenceId(referenceId);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyNotifications(
            String email) {

        User user = findUserByEmail(email);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(notificationMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyUnreadNotifications(
            String email) {

        User user = findUserByEmail(email);

        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(notificationMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getMyUnreadCount(
            String email) {

        User user = findUserByEmail(email);

        return notificationRepository
                .countByUserIdAndReadFalse(
                        user.getId()
                );
    }

    @Override
    public void markAsRead(
            String email,
            Long notificationId) {

        User user = findUserByEmail(email);

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(user.getId())) {

            throw new IllegalStateException(
                    "You cannot modify another user's notification"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(
            String email) {

        User user = findUserByEmail(email);

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                user.getId()
                        );

        notifications.forEach(
                notification -> notification.setRead(true)
        );

        notificationRepository.saveAll(notifications);
    }

    @Override
    public void deleteNotification(
            String email,
            Long notificationId) {

        User user = findUserByEmail(email);

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(user.getId())) {

            throw new IllegalStateException(
                    "You cannot delete another user's notification"
            );
        }

        notificationRepository.delete(notification);
    }

    private User findUserByEmail(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: "
                                        + email
                        )
                );
    }
}