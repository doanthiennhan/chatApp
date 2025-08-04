package com.example.camera.scheduler;

import com.example.camera.dto.request.CheckCameraRequest;
import com.example.camera.entity.Camera;
import com.example.camera.repository.CameraRepository;
import com.example.camera.repository.httpClient.AgentServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class CameraHealthChecker {

    private final CameraRepository cameraRepository;
    private final AgentServiceClient agentServiceClient;

    @Scheduled(fixedDelay = 5000)
    public void checkAllCamerasViaApi() {
        log.info("Gửi yêu cầu kiểm tra health camera lúc {}", Instant.now());

        List<Camera> cameras = cameraRepository.findAll();
        if (cameras.isEmpty()) {
            log.info("Không có camera nào để kiểm tra");
            return;
        }

        List<CheckCameraRequest> requests = cameras.stream()
                .map(camera -> CheckCameraRequest.builder()
                        .id(camera.getId())
                        .rtspUrl(camera.getRtspUrl())
                        .build())
                .collect(Collectors.toList());

        try {
            agentServiceClient.checkCamera(requests);
            log.info("Đã gửi {} yêu cầu kiểm tra health camera", requests.size());
        } catch (Exception e) {
            log.error("Lỗi khi gọi agent-service để kiểm tra camera: {}", e.getMessage(), e);
        }
    }
}
