package net.javaguides.springboot.mapper;

import org.springframework.stereotype.Component;

import net.javaguides.springboot.dto.NotificationResponseDto;
import net.javaguides.springboot.entity.Notification;

@Component
public class NotificationMapper {

    public NotificationResponseDto toResponseDto(
            Notification notification) {

        NotificationResponseDto dto =
                new NotificationResponseDto();

        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setReferenceUrl(notification.getReferenceUrl());
        dto.setReferenceId(notification.getReferenceId());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());

        return dto;
    }
}