package com.Backend.features.messages.repository;

import com.Backend.features.authentication.model.User;
import com.Backend.features.messages.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation , Long> {
    List<Conversation> findByAuthorOrRecipient(User userOne, User userTwo);

    Optional<Conversation> findByAuthorAndRecipient(User author, User recipient);

}
