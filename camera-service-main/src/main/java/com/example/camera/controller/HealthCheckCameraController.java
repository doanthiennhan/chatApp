package com.example.camera.controller;

import com.example.camera.dto.CameraHealthReport;
import com.example.camera.dto.response.ApiResponse;
import com.example.camera.dto.response.CameraHealthResponse;
import com.example.camera.service.HealthCheckService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/check")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HealthCheckCameraController {
    HealthCheckService healthCheckService;

    @PostMapping("/{id}")
    public ApiResponse<CameraHealthResponse> healthChecker(@PathVariable("id") String id) {
        return ApiResponse.<CameraHealthResponse>builder()
                .data(healthCheckService.checkCamera(id))
                .build();
    }

    @PostMapping
    public void healthChecks(@RequestBody List<CameraHealthReport> reports) {
        healthCheckService.updateStatusCamera(reports);
    }
}
