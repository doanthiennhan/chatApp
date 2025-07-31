package com.example.camera.repository.httpClient;

import com.example.camera.dto.CameraHealthReport;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "camera-service", url = "http://localhost:8081")
public interface CameraServiceClient {

    @PostMapping("/api/cameras/health")
    void reportCameraHealth(@RequestBody List<CameraHealthReport> reports);

}
