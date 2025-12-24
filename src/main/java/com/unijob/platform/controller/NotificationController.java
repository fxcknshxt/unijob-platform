package com.unijob.platform.controller;

import com.unijob.platform.entity.Notification;
import com.unijob.platform.entity.User;
import com.unijob.platform.repository.NotificationRepository;
import com.unijob.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "08. Уведомления", description = "Система уведомлений пользователей")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository,
                                  UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Получить все уведомления")
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Получить уведомления пользователя")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationRepository.findAll().stream()
                .filter(n -> n.getUser() != null && n.getUser().getId().equals(userId))
                .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Получить непрочитанные уведомления")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId) {
        return notificationRepository.findAll().stream()
                .filter(n -> n.getUser() != null && n.getUser().getId().equals(userId))
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());
    }

    @PostMapping("/user/{userId}")
    @Operation(summary = "Создать уведомление для пользователя")
    public Notification createNotification(@PathVariable Long userId,
                                           @RequestBody Map<String, String> request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setText(request.get("text"));
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Пометить уведомление как прочитанное")
    public Notification markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Уведомление не найдено"));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}