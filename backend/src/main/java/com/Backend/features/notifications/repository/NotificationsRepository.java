package com.Backend.features.notifications.repository;

import com.Backend.features.authentication.model.User;
import com.Backend.features.notifications.model.Notifications;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationsRepository extends JpaRepository<Notifications,Long> {
    List<Notifications> findByRecipientOrderByCreationDateDesc(User user);
}
