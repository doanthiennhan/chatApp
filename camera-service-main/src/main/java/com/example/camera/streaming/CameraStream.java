package com.example.camera.streaming;

import com.example.camera.entity.Camera;
import com.example.camera.repository.CameraRepository;
import com.example.camera.service.CameraStreamService;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraStream {
    final String cameraId;
    final String rtspUrl;
    Process ffmpegProcess;
    final Set<StreamWebSocketHandler.ClientSession> clients = ConcurrentHashMap.newKeySet();
    final AtomicBoolean running = new AtomicBoolean(false);
    final AtomicLong totalBytesSent = new AtomicLong(0);
    Thread outputThread;
    CameraRepository cameraRepository;
    CameraStreamService cameraStreamService;

    @Getter
    String status = "STOPPED";

    public CameraStream(String cameraId, String rtspUrl, CameraStreamService cameraStreamService) {
        this.cameraId = cameraId;
        this.rtspUrl = rtspUrl;
        this.cameraStreamService = cameraStreamService;
    }

    public synchronized void start() {
        if (running.get()) {
            log.info("Stream already running for camera {}", cameraId);
            return;
        }

        try {
            ProcessBuilder pb = getProcessBuilder();
            ffmpegProcess = pb.start();

            outputThread = new Thread(() -> {
                byte[] buffer = new byte[4096];
                int bytesRead;
                int[] frameCount = {0};

                try {
                    while (running.get() &&
                            (bytesRead = ffmpegProcess.getInputStream().read(buffer)) != -1) {
                        if (bytesRead > 0) {
                            byte[] data = new byte[bytesRead];
                            System.arraycopy(buffer, 0, data, 0, bytesRead);

                            totalBytesSent.addAndGet(bytesRead);

                            frameCount[0]++;
                            broadcast(data);
                        }
                    }
                } catch (IOException e) {
                    if (running.get()) {
                        log.error("Error reading FFmpeg stream data for camera {}: {}", cameraId, e.getMessage());
                    }
                }
            }, "FFmpeg-Streamer-" + cameraId);

            outputThread.setDaemon(true);
            running.set(true);
            outputThread.start();


            // Monitor process
            new Thread(() -> {
                try {
                    int exitCode = ffmpegProcess.waitFor();
                    if (running.get()) {
                        log.error("FFmpeg process exited with code {} for camera {}", exitCode, cameraId);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "FFmpeg-Monitor-" + cameraId).start();

            status = "STREAMING";
            log.info("✅ Started streaming for camera {} with {} clients", cameraId, clients.size());

        } catch (IOException e) {
            log.error("❌ Failed to start streaming for camera {}: {}", cameraId, e.getMessage());
        }
    }

    private ProcessBuilder getProcessBuilder() {
        String[] command = {
                "ffmpeg",
                "-rtsp_transport", "tcp",
                "-i", rtspUrl,
                "-c:v", "mpeg1video",
                "-f", "mpegts",
                "-c:a", "mp2",
                "-b:a", "128k",
                "-s", "640x480",
                "-q", "5",
                "-r", "30",
                "-" // pipe output
        };
        log.info("FFmpeg command: {}", String.join(" ", command));
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        return pb;
    }

    public synchronized void stop() {
        if (!running.get()) {
            return;
        }

        running.set(false);

        if (ffmpegProcess != null) {
            ffmpegProcess.destroy();
            try {
                if (!ffmpegProcess.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)) {
                    ffmpegProcess.destroyForcibly();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                ffmpegProcess.destroyForcibly();
            }
            ffmpegProcess = null;
        }

        if (outputThread != null) {
            outputThread.interrupt();
            outputThread = null;
        }

        status = "STOPPED";
        cameraStreamService.saveLastFrame(cameraId);
        log.info("Stopped streaming for camera {}", cameraId);
    }

    public void addClient(StreamWebSocketHandler.ClientSession client) {
        clients.add(client);
        log.info("Added client to camera {}. Total clients: {}", cameraId, clients.size());

        if (!running.get()) {
            start();
        }
    }

    public void removeClient(StreamWebSocketHandler.ClientSession client) {
        clients.remove(client);
        log.info("Removed client from camera {}. Remaining clients: {}", cameraId, clients.size());

        System.out.println("số người xem là : "+ clients.size());
        if (clients.isEmpty()) {
            System.out.println("không còn nguwofi xem nào nữa ");
            stop();
        }
    }

    private void broadcast(byte[] data) {
        Set<StreamWebSocketHandler.ClientSession> currentClients = Set.copyOf(clients);

        for (StreamWebSocketHandler.ClientSession client : currentClients) {
            try {
                if (client.isOpen()) {
                    client.send(data);
                } else {
                    clients.remove(client);
                }
            } catch (Exception e) {
                log.debug("Error sending data to client for camera {}: {}", cameraId, e.getMessage());
                clients.remove(client);
            }
        }
    }

    public boolean hasClients() {
        return !clients.isEmpty();
    }

    public int getClientCount() {
        return clients.size();
    }

}
