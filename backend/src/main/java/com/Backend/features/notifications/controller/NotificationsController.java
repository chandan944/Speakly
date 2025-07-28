package com.Backend.features.notifications.controller;

import com.Backend.features.authentication.model.User;
import com.Backend.features.notifications.model.Notifications;
import com.Backend.features.notifications.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationsController {


    private final NotificationService notificationService;

    public NotificationsController(NotificationService notificationService) {
        this.notificationService = notificationService;

    }

    @GetMapping
    public List<Notifications> getUserNotification(@RequestAttribute("authenticatedUser")User user){
        return notificationService.getUserNotification(user);
    }

    @PutMapping("/{notificationId}")
    public Notifications markNotificationAsRead(@PathVariable Long notificationId) {
        return notificationService.markNotificationAsRead(notificationId);
    }
}
