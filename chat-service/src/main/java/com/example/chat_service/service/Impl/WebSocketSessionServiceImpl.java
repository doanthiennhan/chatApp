package com.example.chat_service.service.Impl;

import org.springframework.stereotype.Service;

import com.example.chat_service.entity.WebSocketSession;
import com.example.chat_service.repository.WebSocketSessionRepository;
import com.example.chat_service.service.WebSocketSessionService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WebSocketSessionServiceImpl implements WebSocketSessionService {
    WebSocketSessionRepository webSocketSessionRepository;

    @Override
    public WebSocketSession create(WebSocketSession webSocketSession) {
        return webSocketSessionRepository.save(webSocketSession);
    }

    @Override
    public void deleteSession(String sessionId) {
        webSocketSessionRepository.deleteBySocketSessionId(sessionId);
    }
}
