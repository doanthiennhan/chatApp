package com.example.camera.service.Impl;

import com.example.camera.dto.CameraStreamState;
import com.example.camera.dto.request.StreamControlRequest;
import com.example.camera.entity.Camera;
import com.example.camera.enums.CameraStatus;
import com.example.camera.exception.AppException;
import com.example.camera.exception.ErrorCode;
import com.example.camera.repository.CameraLogRepository;
import com.example.camera.repository.CameraRepository;
import com.example.camera.service.CameraStreamService;
import com.example.camera.util.UrlUtil;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CameraStreamServiceImpl implements CameraStreamService {

    static final String SRS_RTMP_URL = "rtmp://localhost:1935/live/";
    Map<String, CameraStreamState> streamStates = new ConcurrentHashMap<>();
    Map<String, SseEmitter> cameraEmitters = new ConcurrentHashMap<>();
    CameraRepository cameraRepository;
    CameraLogRepository cameraLogRepository;
    UrlUtil urlUtil;

    @Override
    @Transactional
    public boolean startStream(StreamControlRequest request) {
        Camera camera = cameraRepository.findById(request.getCameraId())
                .orElseThrow(() -> new AppException(ErrorCode.CAMERA_NOT_FOUND));

        CameraStreamState currentState = streamStates.get(camera.getId());

        if (currentState != null) {
            if (!request.isForceRestart()) {
                currentState.incrementViewers();
                log.info("Stream already running for camera: {} (viewers: {})", camera.getId(), currentState.getCurrentViewers());
                return true;
            } else {
                stopStream(request);
            }
        }

        String command = String.format(
                "ffmpeg -i %s -c:v copy -c:a aac -f flv %s%s",
                camera.getRtspUrl(), SRS_RTMP_URL, camera.getId()
        );

        try {
            Process process = new ProcessBuilder(command.split(" "))
                    .redirectErrorStream(true)
                    .start();

            CameraStreamState newState = CameraStreamState.create(process, camera.getId());
            streamStates.put(camera.getId(), newState);

            camera.setStatus(CameraStatus.ONLINE);
            cameraRepository.save(camera);

            log.info("Started stream for camera: {}", camera.getId());
            return true;

        } catch (IOException e) {
            log.error("Failed to start stream for camera {}: {}", camera.getId(), e.getMessage());
            return false;
        }
    }

    @Override
    public boolean stopStream(StreamControlRequest request) {
        String cameraId = request.getCameraId();
        CameraStreamState state = streamStates.get(cameraId);

        if (state == null) {
            log.info("No active stream found for camera: {}", cameraId);
            return false;
        }

        state.decrementViewers();
        if (state.getCurrentViewers() <= 0) {
            state.stop();
            streamStates.remove(cameraId);

            cameraRepository.findById(cameraId).ifPresent(camera -> {
                camera.setStatus(CameraStatus.OFFLINE);
                cameraRepository.save(camera);
            });

            log.info("Stopped stream for camera: {}", cameraId);
        } else {
            log.info("Viewer left camera: {}. Remaining viewers: {}", cameraId, state.getCurrentViewers());
        }

        return true;
    }
}
