package com.example.Agent.service.Impl;

import com.example.Agent.dto.CameraHealthReport;
import com.example.Agent.dto.CameraToCheck;
import com.example.Agent.repository.httpClient.CameraServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AgentHealthCheckerServiceImpl {
    private final CameraServiceClient cameraServiceClient;
    private final ExecutorService executor = Executors.newFixedThreadPool(10);

    public void process(List<CameraToCheck> cameras) {
        List<CameraHealthReport> reports = Collections.synchronizedList(new ArrayList<>());

        List<CompletableFuture<Void>> futures = cameras.stream()
                .map(cam -> CompletableFuture.runAsync(() -> {
                    boolean streamOK = checkStream(cam.getRtspUrl());
                    String status = streamOK ? "OK" : "STREAM_ERROR";
                    reports.add(new CameraHealthReport(cam.getId(), status));
                }, executor))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        cameraServiceClient.reportCameraHealth(reports);
    }

    private boolean checkStream(String rtspUrl) {
        try {
            ProcessBuilder builder = new ProcessBuilder("ffmpeg", "-i", rtspUrl, "-t", "2", "-f", "null", "-");
            Process process = builder.start();
            return process.waitFor(5, TimeUnit.SECONDS) == 0;
        } catch (Exception e) {
            return false;
        }
    }
}
