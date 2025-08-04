package com.example.Agent.service.Impl;

import com.example.Agent.dto.CameraHealthReport;
import com.example.Agent.dto.CameraToCheck;
import com.example.Agent.enums.CameraStatus;
import com.example.Agent.repository.httpClient.CameraServiceClient;
import com.example.Agent.service.AgentHealthCheckerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AgentHealthCheckerServiceImpl implements AgentHealthCheckerService {
    private final CameraServiceClient cameraServiceClient;
    private final ExecutorService executor = Executors.newFixedThreadPool(10);

    public void process(List<CameraToCheck> cameras) {
        List<CameraHealthReport> reports = Collections.synchronizedList(new ArrayList<>());

        List<CompletableFuture<Void>> futures = cameras.stream()
                .map(cam -> CompletableFuture.runAsync(() -> {
                    boolean streamOK = checkStream(cam.getRtspUrl());
                    String status = streamOK ? CameraStatus.ONLINE.toString() : CameraStatus.ERROR.toString();
                    reports.add(new CameraHealthReport(cam.getId(), status));
                }, executor))
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        cameraServiceClient.reportCameraHealth(reports);
    }

//    private boolean checkStream(String rtspUrl) {
//        try {
//            ProcessBuilder builder = new ProcessBuilder("ffmpeg", "-i", rtspUrl, "-t", "2", "-f", "null", "-");
//            Process process = builder.start();
//            if (process.waitFor(5, TimeUnit.SECONDS)) {
//                return process.exitValue() == 0;
//            } else {
//                return false;
//            }
//
//        } catch (Exception e) {
//            return false;
//        }
//    }
    private boolean checkStream(String rtspUrl) {
        try {
            ProcessBuilder builder = new ProcessBuilder("ffprobe", "-v", "error", "-show_entries",
                    "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", rtspUrl);
            Process process = builder.start();
            return process.waitFor(5, TimeUnit.SECONDS) && process.exitValue() == 0;
        } catch (Exception e) {
            return false;
        }
    }

}
