package com.example.chat_service.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.chat_service.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    Page<ChatMessage> findAllByConversationIdOrderByCreatedDateAsc(String conversationId, Pageable pageable);

    Page<ChatMessage> findAllByConversationId(String conversationId, Pageable pageable);
}
