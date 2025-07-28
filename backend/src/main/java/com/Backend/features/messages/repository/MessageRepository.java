package com.Backend.features.messages.repository;

import com.Backend.features.messages.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message ,Long> {
}
