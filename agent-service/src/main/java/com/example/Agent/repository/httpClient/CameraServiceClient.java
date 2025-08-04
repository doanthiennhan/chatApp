package com.example.Agent.repository.httpClient;

import com.example.Agent.dto.CameraHealthReport;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "camera-service", url = "${camera-service.url}")
public interface CameraServiceClient {


    @PostMapping("/api/check")
    void reportCameraHealth(@RequestBody List<CameraHealthReport> reports);
}