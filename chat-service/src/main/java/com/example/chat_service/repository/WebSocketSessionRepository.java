package com.example.chat_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.chat_service.entity.WebSocketSession;

@Repository
public interface WebSocketSessionRepository extends JpaRepository<WebSocketSession, String> {
    void deleteBySocketSessionId(String socketId);

    List<WebSocketSession> findAllByUserIdIn(List<String> userIds);
}
