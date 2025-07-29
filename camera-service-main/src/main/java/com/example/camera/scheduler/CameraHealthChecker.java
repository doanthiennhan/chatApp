//package com.example.camera.scheduler;
//
//import com.example.camera.dto.response.CameraHealthResponse;
//import com.example.camera.entity.Camera;
//import com.example.camera.enums.CameraStatus;
//import com.example.camera.repository.CameraRepository;
//import com.example.camera.repository.CameraLogRepository;
//import com.example.camera.entity.CameraLog;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//
//import java.io.BufferedReader;
//import java.io.InputStreamReader;
//import java.time.Instant;
//import java.util.List;
//
//
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class CameraHealthChecker {
//
//    private final CameraRepository cameraRepository;
//    private final CameraLogRepository cameraLogRepository;
//    private final SimpMessagingTemplate messagingTemplate;
//
//    @Scheduled(cron = "0 */5 * * * *")
//    public void checkAllCameras() {
//        log.info("📡 Bắt đầu kiểm tra camera lúc {}", Instant.now());
//        List<Camera> cameras = cameraRepository.findAll();
//
//        for (Camera camera : cameras) {
//            boolean isHealthy = checkRtspConnection(camera.getRtspUrl());
//            CameraStatus newStatus = isHealthy ? CameraStatus.ONLINE : CameraStatus.OFFLINE;
//
//            if (camera.getStatus() != newStatus) {
//                camera.setStatus(newStatus);
//                cameraRepository.save(camera);
//
//                cameraLogRepository.save(CameraLog.builder()
//                        .camera(camera)
//                        .status(newStatus)
//                        .message("Health check status update")
//                        .timestamp(Instant.now())
//                        .build());
//
//                sendWebSocketMessageIfNeeded(camera);
//            }
//        }
//        log.info("✅ Hoàn tất kiểm tra camera lúc {}", Instant.now());
//    }
//
//    private boolean checkRtspConnection(String rtspUrl) {
//        Process process = null;
//        try {
//            ProcessBuilder builder = new ProcessBuilder(
//                    "ffmpeg", "-rtsp_transport", "tcp", "-i", rtspUrl,
//                    "-t", "3", "-f", "null", "-"
//            );
//            builder.redirectErrorStream(true);
//            process = builder.start();
//
//            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
//            while (reader.readLine() != null); // consume silently
//
//            return process.waitFor() == 0;
//        } catch (Exception e) {
//            log.warn("❌ Lỗi khi kiểm tra RTSP [{}]: {}", rtspUrl, e.getMessage());
//            return false;
//        } finally {
//            if (process != null) process.destroy();
//        }
//    }
//
//    private void sendWebSocketMessageIfNeeded(Camera camera) {
//        // 🔔 Gửi thông báo WebSocket với metadata stream info nếu camera đang được theo dõi (do frontend đăng ký theo topic cụ thể)
//        if (camera.getStreamInfo() == null) return;
//
//        CameraHealthResponse response = new CameraHealthResponse(
//                camera.getId(),
//                camera.getStreamInfo().getVideoCodec(),
//                camera.getStreamInfo().getAudioCodec(),
//                camera.getStreamInfo().getResolution(),
//                camera.getStreamInfo().getFrameRate(),
//                camera.getStreamInfo().getBitRate(),
//                camera.getStreamInfo().getFormat(),
//                camera.getStreamInfo().getUpdatedAt()
//        );
//
//        messagingTemplate.convertAndSend("/topic/camera-health/" + camera.getId(), response);
//    }
//}
