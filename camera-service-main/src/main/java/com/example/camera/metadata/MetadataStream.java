package com.example.camera.metadata;

import com.example.camera.dto.response.CameraMetadata;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
public class MetadataStream {

    final String cameraId;
    final String rtspUrl;
    final Set<MetadataWebSocketHandler.ClientSession> clients = ConcurrentHashMap.newKeySet();
    final AtomicBoolean running = new AtomicBoolean(false);
    Thread metadataThread;

    static final ObjectMapper objectMapper = new ObjectMapper();

    @Getter
    String status = "STOPPED";

    public MetadataStream(String cameraId, String rtspUrl) {
        this.cameraId = cameraId;
        this.rtspUrl = rtspUrl;
    }

    public synchronized void start() {
        if (running.get()) return;

        running.set(true);
        metadataThread = new Thread(() -> {
            long startTime = System.currentTimeMillis();

            while (running.get()) {
                try {
                    Thread.sleep(3000);
                    long uptime = (System.currentTimeMillis() - startTime) / 1000;

                    String metadata = extractMetadata(uptime);

                    if (metadata != null) {
                        broadcastMetadata(metadata);
                    }

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

        }, "Metadata-Thread-" + cameraId);

        metadataThread.setDaemon(true);
        metadataThread.start();

        status = "RUNNING";
        log.info("Started metadata stream for camera {}", cameraId);
    }

    public synchronized void stop() {
        if (!running.get()) return;

        running.set(false);
        if (metadataThread != null) {
            metadataThread.interrupt();
            metadataThread = null;
        }

        status = "STOPPED";
        log.info("Stopped metadata stream for camera {}", cameraId);
    }

    public void addClient(MetadataWebSocketHandler.ClientSession client) {
        clients.add(client);
        log.info("➕ Metadata client added for camera {}. Total: {}", cameraId, clients.size());
        if (!running.get()) {
            start();
        }
    }

    public void removeClient(MetadataWebSocketHandler.ClientSession client) {
        clients.remove(client);
        log.info("➖ Metadata client removed for camera {}. Remaining: {}", cameraId, clients.size());
        if (clients.isEmpty()) {
            stop();
        }
    }

    private void broadcastMetadata(String json) {
        for (MetadataWebSocketHandler.ClientSession client : Set.copyOf(clients)) {
            try {
                if (client.isOpen()) {
                    client.send(json);
                } else {
                    clients.remove(client);
                }
            } catch (Exception e) {
                log.warn("❌ Failed to send metadata to client: {}", e.getMessage());
                clients.remove(client);
            }
        }
    }

    private String extractMetadata(long uptime) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "ffprobe",
                    "-v", "error",
                    "-select_streams", "v:0",
                    "-show_entries", "stream=width,height,bit_rate,avg_frame_rate",
                    "-of", "default=noprint_wrappers=1",
                    rtspUrl
            );
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            String width = "0", height = "0", bitrate = "0", fps = "0";

            while ((line = reader.readLine()) != null) {
                if (line.startsWith("width=")) width = line.split("=")[1];
                else if (line.startsWith("height=")) height = line.split("=")[1];
                else if (line.startsWith("bit_rate=")) bitrate = line.split("=")[1];
                else if (line.startsWith("avg_frame_rate=")) {
                    String[] parts = line.split("=")[1].split("/");
                    if (parts.length == 2 && !parts[1].equals("0")) {
                        fps = String.valueOf(Integer.parseInt(parts[0]) / Integer.parseInt(parts[1]));
                    }
                }
            }

            process.waitFor();

            CameraMetadata metadata = new CameraMetadata(
                    cameraId,
                    fps,
                    width + "x" + height,
                    bitrate,
                    uptime,
                    "ONLINE",
                    getClientCount()
            );

            return objectMapper.writeValueAsString(metadata);

        } catch (Exception e) {
            log.error("❌ Failed to extract metadata for camera {}: {}", cameraId, e.getMessage());
            return null;
        }
    }

    public boolean hasClients() {
        return !clients.isEmpty();
    }

    public int getClientCount() {
        return clients.size();
    }
}
