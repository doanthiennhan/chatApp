package com.example.chat_service.service;

import com.example.chat_service.entity.WebSocketSession;

public interface WebSocketSessionService {
    WebSocketSession create(WebSocketSession webSocketSession);

    public void deleteSession(String sessionId);
}
