package com.Backend.features.messages.service;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.service.AuthService;
import com.Backend.features.messages.model.Conversation;
import com.Backend.features.messages.model.Message;
import com.Backend.features.messages.repository.ConversationRepository;
import com.Backend.features.messages.repository.MessageRepository;
import com.Backend.features.notifications.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class
MessageService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final AuthService authenticationService;
    private final NotificationService notificationService;

    public MessageService(ConversationRepository conversationRepository, MessageRepository messageRepository, AuthService authenticationService, NotificationService notificationService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.authenticationService = authenticationService;
        this.notificationService = notificationService;
    }

    public List<Conversation> getConversationsOfUser(User user) {
        return conversationRepository.findByAuthorOrRecipient(user, user);
    }

    public Conversation getConversation(User user, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        if (!conversation.getAuthor().getId().equals(user.getId()) && !conversation.getRecipient().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User not authorized to view conversation");
        }
        return conversation;
    }

    @Transactional
    public Conversation createConversationAndAddMessage(User sender, Long receiverId, String content) {
        User receiver = authenticationService.getUserById(receiverId);
        conversationRepository.findByAuthorAndRecipient(sender, receiver).ifPresentOrElse(
                conversation -> {
                    throw new IllegalArgumentException("Conversation already exists, use the conversation id to send messages.");
                },
                () -> {
                }
        );

        conversationRepository.findByAuthorAndRecipient(receiver, sender).ifPresentOrElse(
                conversation -> {
                    throw new IllegalArgumentException("Conversation already exists, use the conversation id to send messages.");
                },
                () -> {
                }
        );

        Conversation conversation = conversationRepository.save(new Conversation(sender, receiver));
        Message message = new Message(sender, receiver, conversation, content);
        messageRepository.save(message);
        conversation.getMessages().add(message);
        notificationService.sendConversationToUsers(sender.getId(), receiver.getId(), conversation);
        return conversation;
    }

    public Message addMessageToConversation(Long conversationId, User sender, Long receiverId, String content) {
        User receiver = authenticationService.getUserById(receiverId);
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.getAuthor().getId().equals(sender.getId()) && !conversation.getRecipient().getId().equals(sender.getId())) {
            throw new IllegalArgumentException("User not authorized to send message to this conversation");
        }

        if (!conversation.getAuthor().getId().equals(receiver.getId()) && !conversation.getRecipient().getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Receiver is not part of this conversation");
        }

        Message message = new Message(sender, receiver, conversation, content);
        messageRepository.save(message);
        conversation.getMessages().add(message);
        notificationService.sendMessageToConversation(conversation.getId(), message);
        notificationService.sendConversationToUsers(sender.getId(), receiver.getId(), conversation);
        return message;
    }

    public void markMessageAsRead(User user, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getReceiver().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User not authorized to mark message as read");
        }

        if (!message.getIsRead()) {
            message.setIsRead(true);
            messageRepository.save(message);

            // ✅ Broadcast the updated message over WebSocket
            notificationService.sendMessageToConversation(message.getConversation().getId(), message);
        }
    }
}
