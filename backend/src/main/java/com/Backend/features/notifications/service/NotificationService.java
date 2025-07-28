package com.Backend.features.notifications.service;

import com.Backend.features.authentication.model.User;
import com.Backend.features.feed.model.Comment;
import com.Backend.features.feed.model.Post;
import com.Backend.features.messages.model.Conversation;
import com.Backend.features.messages.model.Message;
import com.Backend.features.network.model.Connection;
import com.Backend.features.network.model.Status;
import com.Backend.features.notifications.model.NotificationType;
import com.Backend.features.notifications.model.Notifications;
import com.Backend.features.notifications.repository.NotificationsRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class NotificationService {
    private final NotificationsRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationsRepository notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;

        this.messagingTemplate = messagingTemplate;
    }

    public List<Notifications> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreationDateDesc(user);
    }

    public void sendLikeToPost(Long postId, Set<User> likes) {
        messagingTemplate.convertAndSend("/topic/likes/" + postId, likes);
    }

    public void sendCommentToPost(Long postId, Comment comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId, comment);
    }

    public void sendDeleteCommentToPost(Long postId, Comment comment) {
        messagingTemplate.convertAndSend("/topic/comments/" + postId + "/delete", comment);
    }

    public void sendCommentNotification(User sender, User postOwner, Long postId) {
        if (sender.getId().equals(postOwner.getId())) {
            return; // No need to notify yourself
        }

        Notifications notification = new Notifications(
                postOwner,     // ✅ RECIPIENT: post author (who receives notification)
                sender,        // ✅ SENDER: person who liked (who performed action)
                NotificationType.COMMENT,
                postId
        );

        notificationRepository.save(notification);

        messagingTemplate.convertAndSend(
                "/topic/users/" + postOwner.getId() + "/notifications",
                notification
        );
    }

    // ✅ BACKEND FIX - sendLikeNotification method
    public void sendLikeNotification(User sender, User postOwner, Long postId) {
        if (sender.getId().equals(postOwner.getId())) {
            return; // Don't notify yourself
        }

        Notifications notification = new Notifications(
                postOwner,     // ✅ RECIPIENT: post author (who receives notification)
                sender,        // ✅ SENDER: person who liked (who performed action)
                NotificationType.LIKE,
                postId
        );

        notificationRepository.save(notification);

        messagingTemplate.convertAndSend(
                "/topic/users/" + postOwner.getId() + "/notifications",
                notification
        );
    }

    public Notifications markNotificationAsRead(Long notificationId) {
        Notifications notification = notificationRepository.findById(notificationId).orElseThrow(() -> new IllegalArgumentException("Notifications not found"));
        notification.setRead(true);
        messagingTemplate.convertAndSend("/topic/users/" + notification.getRecipient().getId() + "/notifications", notification);
        return notificationRepository.save(notification);
    }
//    public void sendConversationToUsers(Long senderId, Long receiverId, Conversation conversation) {
//        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/conversations", conversation);
//        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/conversations", conversation);
//    }
//
//
//    public void sendMessageToConversation(Long conversationId, Message message) {
//        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/messages", message);
//    }

    public void sendNewInvitationToUsers(Long senderId, Long receiverId, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/connections/new", connection);
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/connections/new", connection);
    }

    public List<Notifications> getUserNotification(User user) {
        return notificationRepository.findByRecipientOrderByCreationDateDesc(user);
    }
    public void sendInvitationAcceptedToUsers(Long senderId, Long receiverId, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/connections/accepted", connection);
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/connections/accepted", connection);
    }

    public void sendRemoveConnectionToUsers(Long senderId, Long receiverId, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/connections/remove", connection);
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/connections/remove", connection);
    }

    public void sendConnectionSeenNotification(Long id, Connection connection) {
        messagingTemplate.convertAndSend("/topic/users/" + id + "/connections/seen", connection);
    }
    public void sendDeleteNotificationToPost(Long postId) {
        messagingTemplate.convertAndSend("/topic/posts/" + postId + "/delete", postId);
    }

    public void sendEditNotificationToPost(Long postId, Post post) {
        messagingTemplate.convertAndSend("/topic/posts/" + postId + "/edit", post);
    }

    public void sendNewPostNotificationToFeed(Post post) {
        for (Connection connection : post.getAuthor().getInitiatedConnections()) {
            if (connection.getStatus().equals(Status.ACCEPTED)) {
                messagingTemplate.convertAndSend("/topic/feed/" + connection.getRecipient().getId() + "/post", post);
            }
        }
        for (Connection connection : post.getAuthor().getReceivedConnections()) {
            if (connection.getStatus().equals(Status.ACCEPTED)) {
                messagingTemplate.convertAndSend("/topic/feed/" + connection.getAuthor().getId() + "/post", post);
            }
        }
    }

    public void sendMessageToConversation(Long conversationId, Message message) {
        messagingTemplate.convertAndSend("/topic/conversations/" + conversationId + "/messages", message);
    }

    public void sendConversationToUsers(Long senderId, Long receiverId, Conversation conversation) {
        messagingTemplate.convertAndSend("/topic/users/" + senderId + "/conversations", conversation);
        messagingTemplate.convertAndSend("/topic/users/" + receiverId + "/conversations", conversation);
    }
}

