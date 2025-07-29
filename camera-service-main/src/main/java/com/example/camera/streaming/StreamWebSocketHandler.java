package com.example.camera.streaming;

import com.example.camera.entity.Camera;
import com.example.camera.exception.AppException;
import com.example.camera.exception.ErrorCode;
import com.example.camera.repository.CameraRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StreamWebSocketHandler extends BinaryWebSocketHandler {

    CameraRepository cameraRepository;
    Map<String, CameraStream> activeStreams = new ConcurrentHashMap<>();

    public static class ClientSession {
        WebSocketSession session;

        public ClientSession(WebSocketSession session) {
            this.session = session;
        }

        public boolean isOpen() {
            return session.isOpen();
        }

        public void send(byte[] data) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new BinaryMessage(data));
                }
            } catch (Exception e) {
                log.debug("Error sending message: {}", e.getMessage());
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        try {
            UriComponents uri = UriComponentsBuilder.fromUri(session.getUri()).build();
            String cameraId = uri.getQueryParams().getFirst("cameraId");

            if (cameraId == null) {
                log.error("No camera ID provided");
                session.close(CloseStatus.BAD_DATA);
                return;
            }
            Camera camera = cameraRepository.findById(cameraId)
                    .orElseThrow(()-> new AppException(ErrorCode.CAMERA_NOT_FOUND));

            String rtspUrl = camera.getRtspUrl();

            if (rtspUrl == null) {
                log.error("Camera {} not found or RTSP URL not available", cameraId);
                session.close(CloseStatus.BAD_DATA);
                return;
            }

            ClientSession clientSession = new ClientSession(session);
            CameraStream stream = activeStreams.computeIfAbsent(cameraId,
                    id -> new CameraStream(id, rtspUrl));

            stream.addClient(clientSession);
            session.getAttributes().put("cameraId", cameraId);

            log.info("Client connected to camera {}. Total clients: {}",
                    cameraId, stream.getClientCount());

        } catch (Exception e) {
            log.error("Error establishing connection: {}", e.getMessage());
            try {
                session.close(CloseStatus.SERVER_ERROR);
            } catch (Exception ex) {
                log.error("Error closing session: {}", ex.getMessage());
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        try {
            Object cameraIdObj = session.getAttributes().get("cameraId");
            if (cameraIdObj == null) return;
            String cameraId = cameraIdObj.toString();
            if (cameraId != null) {
                CameraStream stream = activeStreams.get(cameraId);
                if (stream != null) {
                    stream.removeClient(new ClientSession(session));

                    if (!stream.hasClients()) {
                        activeStreams.remove(cameraId);
                        log.info("Removed stream for camera {} as it has no clients", cameraId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error closing connection: {}", e.getMessage());
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("Transport error: {}", exception.getMessage());
        try {
            session.close(CloseStatus.SERVER_ERROR);
        } catch (Exception e) {
            log.error("Error closing session after transport error: {}", e.getMessage());
        }
    }

}