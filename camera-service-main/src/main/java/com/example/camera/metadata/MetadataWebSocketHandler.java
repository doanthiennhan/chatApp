package com.example.camera.metadata;

import com.example.camera.entity.Camera;
import com.example.camera.exception.AppException;
import com.example.camera.exception.ErrorCode;
import com.example.camera.repository.CameraRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class    MetadataWebSocketHandler extends TextWebSocketHandler {

    CameraRepository cameraRepository;
    Map<String, MetadataStream> activeMetadata = new ConcurrentHashMap<>();

    public static class ClientSession {
        WebSocketSession session;

        public ClientSession(WebSocketSession session) {
            this.session = session;
        }

        public boolean isOpen() {
            return session.isOpen();
        }

        public void send(String json) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(json));
                }
            } catch (Exception e) {
                log.debug("Error sending metadata: {}", e.getMessage());
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        try {
            String cameraId = UriComponentsBuilder.fromUri(session.getUri())
                    .build()
                    .getQueryParams()
                    .getFirst("cameraId");

            if (cameraId == null) {
                log.error("No camera ID provided for metadata");
                session.close(CloseStatus.BAD_DATA);
                return;
            }

            Camera camera = cameraRepository.findById(cameraId)
                    .orElseThrow(() -> new AppException(ErrorCode.CAMERA_NOT_FOUND));

            String rtspUrl = camera.getRtspUrl();
            if (rtspUrl == null) {
                log.error("Camera {} has no RTSP URL", cameraId);
                session.close(CloseStatus.BAD_DATA);
                return;
            }

            ClientSession client = new ClientSession(session);
            MetadataStream metadataStream = activeMetadata.computeIfAbsent(cameraId,
                    id -> new MetadataStream(id, rtspUrl));

            metadataStream.addClient(client);
            session.getAttributes().put("cameraId", cameraId);

            log.info("✅ Metadata client connected to camera {}. Total: {}", cameraId, metadataStream.getClientCount());

        } catch (Exception e) {
            log.error("❌ Error establishing metadata connection: {}", e.getMessage());
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (Exception ex) {
                log.error("Failed to close metadata session: {}", ex.getMessage());
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Object cameraIdObj = session.getAttributes().get("cameraId");
        if (cameraIdObj == null) return;

        String cameraId = cameraIdObj.toString();
        MetadataStream stream = activeMetadata.get(cameraId);
        if (stream != null) {
            stream.removeClient(new ClientSession(session));
            if (!stream.hasClients()) {
                activeMetadata.remove(cameraId);
                log.info("🛑 Removed metadata stream for camera {} as all clients disconnected", cameraId);
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("⚠️ Metadata transport error: {}", exception.getMessage());
        try {
            session.close(CloseStatus.SERVER_ERROR);
        } catch (Exception e) {
            log.error("Error closing session after transport error: {}", e.getMessage());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Not processing incoming messages from client
    }
}
