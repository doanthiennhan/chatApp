package com.example.chat_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.chat_service.entity.Message;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByChannelIdOrderByCreatedAtAsc(UUID channelId);
    Page<Message> findByChannelIdOrderByCreatedAtAsc(UUID channelId, Pageable pageable);
}