package com.example.chat_service.controller;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.response.IntrospectResponse;
import com.example.chat_service.entity.WebSocketSession;
import com.example.chat_service.service.Impl.IdentityService;
import com.example.chat_service.service.WebSocketSessionService;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketHandler {
    SocketIOServer server;
    IdentityService identityService;
    WebSocketSessionService webSocketSessionService;

    @OnConnect
    public void clientConnected(SocketIOClient client) {
        // Get Token from request param
        String token = client.getHandshakeData().getSingleUrlParam("token");

        ApiResponse<IntrospectResponse> response = identityService.introspect(token);

        if (response != null && response.getData().isValid()) {
            IntrospectResponse introspectData = response.getData();
            log.info("Client connected: {}", client.getSessionId());

            WebSocketSession webSocketSession = WebSocketSession.builder()
                    .socketSessionId(client.getSessionId().toString())
                    .userId(introspectData.getUserId())
                    .createdAt(Instant.now())
                    .build();

            webSocketSession = webSocketSessionService.create(webSocketSession);
            log.info("WebSocketSession created with id: {}", webSocketSession.getId());
        } else {
            log.error("Authentication fail: {}", client.getSessionId());
            client.disconnect();
        }
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        log.info("Client disConnected: {}", client.getSessionId());
        webSocketSessionService.deleteSession(client.getSessionId().toString());
    }

    @PostConstruct
    public void startServer() {
        server.addListeners(this);
        server.start();
        log.info("Socket server started");
    }

}