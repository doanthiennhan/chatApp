package com.example.camera.service.Impl;

import com.example.camera.dto.CameraStatusMessage;
import com.example.camera.dto.CameraStreamState;
import com.example.camera.dto.response.CameraHealthResponse;
import com.example.camera.entity.Camera;
import com.example.camera.entity.CameraLog;
import com.example.camera.enums.CameraStatus;
import com.example.camera.exception.AppException;
import com.example.camera.exception.ErrorCode;
import com.example.camera.repository.CameraLogRepository;
import com.example.camera.repository.CameraRepository;
import com.example.camera.service.CameraStreamService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CameraStreamServiceImpl implements CameraStreamService {

    // Lưu trữ trạng thái stream và SseEmitter cho từng camera
    Map<String, CameraStreamState> streamStates = new ConcurrentHashMap<>();
    Map<String, SseEmitter> cameraEmitters = new ConcurrentHashMap<>();

    private final CameraRepository cameraRepository;
    private final CameraLogRepository cameraLogRepository;
    private final String baseUrl;

    public CameraStreamServiceImpl(CameraRepository cameraRepository, CameraLogRepository cameraLogRepository, @Value("${app.base-url}") String baseUrl) {
        this.cameraRepository = cameraRepository;
        this.cameraLogRepository = cameraLogRepository;
        this.baseUrl = baseUrl;
    }

    public synchronized void startViewing(String cameraId) throws IOException {
        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMERA_NOT_FOUND));

        CameraStreamState state = streamStates.get(cameraId);

        // Kiểm tra nếu camera chưa được stream hoặc process đã kết thúc
        if (state == null || !state.getProcess().isAlive()) {
            String outputPath = Paths.get("output", cameraId).toString();
            Files.createDirectories(Paths.get(outputPath));

            ProcessBuilder builder = new ProcessBuilder(
                    "ffmpeg",
                    "-rtsp_transport", "tcp",
                    "-i", camera.getRtspUrl(),
                    "-fflags", "nobuffer",
                    "-flags", "low_delay",
                    "-max_delay", "100000",
                    "-buffer_size", "1024000",
                    "-vcodec", "copy",
                    "-acodec", "aac",
                    "-f", "hls",
                    "-hls_time", "1",
                    "-hls_list_size", "5",
                    "-hls_flags", "delete_segments+append_list+program_date_time",
                    "-hls_allow_cache", "0",
                    "-y",
                    outputPath + "/stream.m3u8"
            );
            builder.redirectErrorStream(true);
            builder.inheritIO();
            Process process = builder.start();

            CameraStreamState newState = new CameraStreamState(process, new AtomicInteger(1));
            streamStates.put(cameraId, newState);

            SseEmitter emitter = new SseEmitter();
            cameraEmitters.put(cameraId, emitter);

            logStatus(camera, CameraStatus.ONLINE, "Stream started");
            notifyStatus(camera, "ONLINE", 1, emitter);
        } else {
            int count = state.getViewerCount().incrementAndGet();
            SseEmitter emitter = cameraEmitters.get(cameraId);
            notifyStatus(camera, "ONLINE", count, emitter);
        }
    }

    public synchronized void stopViewing(String cameraId) {
        CameraStreamState state = streamStates.get(cameraId);
        Camera camera = cameraRepository.findById(cameraId)
                .orElseThrow(() -> new AppException(ErrorCode.CAMERA_NOT_FOUND));
        if (state == null) return;

        int count = state.getViewerCount().decrementAndGet();

        if (count <= 0) {
            saveLastFrame(cameraId);

            state.getProcess().destroy();
            streamStates.remove(cameraId);

            // Khi không còn người xem, đóng emitter và xóa khỏi danh sách
            SseEmitter emitter = cameraEmitters.get(cameraId);
            emitter.complete(); // Đóng kết nối SSE
            cameraEmitters.remove(cameraId);

            logStatus(camera, CameraStatus.OFFLINE, "Stream stopped");
            notifyStatus(camera, "OFFLINE", 0, emitter); // Gửi thông báo ngừng stream
        } else {
            SseEmitter emitter = cameraEmitters.get(cameraId);
            notifyStatus(camera, "ONLINE", count, emitter);
        }
    }

    private void notifyStatus(Camera camera, String status, int viewerCount, SseEmitter emitter) {
        try {
            // Lấy URL RTSP của camera
            String cameraRtspUrl = camera.getRtspUrl();  // Giả sử URL RTSP của camera đã có

            // Lấy thông tin kỹ thuật của camera từ FFmpeg
            CameraHealthResponse msg = getCameraInfoFromFFmpeg( camera, cameraRtspUrl, status, viewerCount);
            log.info("sendsend",msg);

            // Gửi thông báo SSE cho client
            emitter.send(msg);
        } catch (IOException e) {
            // Xử lý lỗi nếu không gửi được thông báo
            System.err.println("Error sending SSE: " + e.getMessage());
        }
    }

    private CameraHealthResponse getCameraInfoFromFFmpeg(Camera camera,String rtspUrl, String status, int viewerCount) throws IOException {
        // Lệnh FFmpeg để lấy thông tin chi tiết của camera
        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg", "-i", rtspUrl, "-hide_banner"
        );
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        String line;

        // Biến lưu trữ thông tin camera
        String videoCodec = "";
        String audioCodec = "";
        String resolution = "";
        String frameRate = "";
        String bitRate = "";
        String format = "";

        // Đọc thông tin trả về từ FFmpeg
        while ((line = reader.readLine()) != null) {
            // Tìm kiếm thông tin codec video, codec âm thanh, độ phân giải, v.v.
            if (line.contains("Video:")) {
                videoCodec = extractCodec(line);
                resolution = extractResolution(line);
                frameRate = extractFrameRate(line);
            }
            if (line.contains("Audio:")) {
                audioCodec = extractAudioCodec(line);
            }
            if (line.contains("bitrate")) {
                bitRate = extractBitrate(line);
            }
            if (line.contains("Output #0")) {
                format = "HLS";  // Định dạng phát trực tiếp HLS
            }
        }

        // Trả về thông tin camera dưới dạng CameraHealthResponse
        return new CameraHealthResponse(camera.getId(), videoCodec, audioCodec, resolution, frameRate, bitRate, format, Instant.now());
    }

    // Các phương thức hỗ trợ để trích xuất thông tin từ dòng FFmpeg
    private String extractCodec(String line) {
        // Trích xuất codec video từ dòng FFmpeg
        if (line.contains("Video:")) {
            return line.split(" ")[1];  // Ví dụ: "Video: h264"
        }
        return "";
    }

    private String extractAudioCodec(String line) {
        if (line.contains("Audio:")) {
            return line.split(" ")[1];
        }
        return "";
    }

    private String extractResolution(String line) {
        if (line.contains("Video:")) {
            String[] parts = line.split(" ");
            for (String part : parts) {
                if (part.contains("x")) {
                    return part;
                }
            }
        }
        return "";
    }

    private String extractFrameRate(String line) {
        if (line.contains("fps")) {
            String[] parts = line.split(" ");
            for (String part : parts) {
                if (part.contains("fps")) {
                    return part;
                }
            }
        }
        return "";
    }

    private String extractBitrate(String line) {
        if (line.contains("bitrate")) {
            String[] parts = line.split(" ");
            for (String part : parts) {
                if (part.contains("kb/s") || part.contains("kbits/s")) {
                    return part;
                }
            }
        }
        return "";
    }


    private void logStatus(Camera camera, CameraStatus status, String message) {
        CameraLog log = CameraLog.builder()
                .camera(camera)
                .status(status)
                .message(message)
                .timestamp(Instant.now())
                .build();
        cameraLogRepository.save(log);
    }

    public void saveLastFrame(String cameraId) {
        try {
            Camera camera = cameraRepository.findById(cameraId)
                    .orElseThrow(() -> new AppException(ErrorCode.CAMERA_NOT_FOUND));

            // Tạo đường dẫn thư mục nếu chưa tồn tại
            Path outputDir = Paths.get("output", cameraId);
            Files.createDirectories(outputDir); // Tạo thư mục nếu chưa có

            String outputPath = outputDir.resolve("snapshot.jpg").toString();

            ProcessBuilder snapshotBuilder = new ProcessBuilder(
                    "ffmpeg", "-y", "-i", camera.getRtspUrl(),
                    "-frames:v", "1", "-q:v", "2", outputPath
            );
            snapshotBuilder.redirectErrorStream(true);

            camera.setSnapshotUrl(baseUrl + "/output/" + camera.getId() + "/snapshot.jpg");
            cameraRepository.save(camera);

            Process process = snapshotBuilder.start();
            process.waitFor(5, TimeUnit.SECONDS);

        } catch (IOException | InterruptedException e) {
            System.err.println("Lỗi khi lưu ảnh cuối: " + e.getMessage());
        }
    }
}

