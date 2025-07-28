package com.Backend.features.messages.controller;


import com.Backend.features.authentication.model.User;
import com.Backend.features.messages.dto.MessageDto;
import com.Backend.features.messages.model.Conversation;
import com.Backend.features.messages.model.Message;
import com.Backend.features.messages.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messaging")
public class MessageController {
    static final Logger log = LoggerFactory.getLogger(MessageController.class);
    private final MessageService messageService ;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversations")
    public List<Conversation> getConversations(@RequestAttribute("authenticatedUser") User user) {
        return messageService.getConversationsOfUser(user);
    }

    @GetMapping("/conversations/{conversationId}")
    public Conversation getConversation(@RequestAttribute("authenticatedUser") User user , @PathVariable Long conversationId){
        return messageService.getConversation(user , conversationId);
    }
    @PostMapping("/conversations")
    public Conversation createConversationAndAddMessage(@RequestAttribute("authenticatedUser") User sender, @RequestBody MessageDto messageDto) {
        return messageService.createConversationAndAddMessage(sender, messageDto.receiverId(), messageDto.content());
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public Message addMessageToConversation(@RequestAttribute("authenticatedUser") User sender, @RequestBody MessageDto messageDto, @PathVariable Long conversationId) {
        return messageService.addMessageToConversation(conversationId, sender, messageDto.receiverId(), messageDto.content());
    }
    @PutMapping("/conversations/messages/{messageId}")
    public MessageDto markMessageAsRead(@RequestAttribute("authenticatedUser") User user, @PathVariable Long messageId) {
        messageService.markMessageAsRead(user, messageId);
        return new MessageDto(user.getId(), "Message marked as read" );
    }
}
