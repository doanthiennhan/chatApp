//package com.example.Agent.service;
//
//import com.example.Agent.dto.request.CameraStatusRequest;
//import com.example.Agent.repository.httpClient.CameraServiceClient;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//
//import java.io.IOException;
//import java.net.InetAddress;
//import java.util.concurrent.TimeUnit;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class CameraMonitorService {
//
//    private final CameraServiceClient cameraClient;
//
//    @Scheduled(fixedDelayString = "${agent.schedule-delay-ms:60000}")
//    public void monitorAllCameras() {
//        List<CameraDTO> cameras = cameraClient.getAllCameras();
//        for (CameraDTO camera : cameras) {
//            log.info("Checking camera: {}", camera.getName());
//
//            boolean reachable = ping(camera.getIp());
//            if (!reachable) {
//                report(camera, "OFFLINE", "Ping failed");
//                continue;
//            }
//
//            boolean streamOk = checkStream(camera.getRtspUrl());
//            if (!streamOk) {
//                report(camera, "STREAM_ERROR", "RTSP stream not accessible");
//                cameraClient.restartCamera(camera.getId());
//            } else {
//                report(camera, "OK", "All good");
//            }
//        }
//    }
//
//    private boolean ping(String ip) {
//        if (ip == null) return false;
//        try {
//            return InetAddress.getByName(ip).isReachable(3000);
//        } catch (IOException e) {
//            return false;
//        }
//    }
//
//    private boolean checkStream(String rtspUrl) {
//        try {
//            ProcessBuilder builder = new ProcessBuilder("ffmpeg", "-i", rtspUrl, "-t", "2", "-f", "null", "-");
//            Process process = builder.start();
//            return process.waitFor(5, TimeUnit.SECONDS) && process.exitValue() == 0;
//        } catch (Exception e) {
//            return false;
//        }
//    }
//
//    private void report(CameraDTO camera, String status, String message) {
//        CameraStatusRequest request = new CameraStatusRequest(camera.getId(), status, message);
//        cameraClient.reportStatus(camera.getId(), request);
//        log.info("Reported [{}] for camera {}: {}", status, camera.getName(), message);
//    }
//}
