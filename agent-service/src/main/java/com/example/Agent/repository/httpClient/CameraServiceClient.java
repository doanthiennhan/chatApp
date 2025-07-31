package com.example.Agent.repository.httpClient;

import com.example.Agent.dto.CameraHealthReport;
import com.example.Agent.dto.request.CameraStatusRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "cameraServiceClient", url = "${camera-service.url}")
public interface CameraServiceClient {

    @PostMapping("/restart")
    void restartCamera(@RequestParam("cameraId") String cameraId);

    @PostMapping("/status")
    void updateCameraStatus(@RequestBody CameraStatusRequest request);

    @PostMapping("/health-report")
    void reportCameraHealth(@RequestBody List<CameraHealthReport> reports);
}