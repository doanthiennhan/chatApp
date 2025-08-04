package com.example.camera.service;

import com.example.camera.dto.CameraHealthReport;
import com.example.camera.dto.response.CameraHealthResponse;

import java.util.List;

public interface HealthCheckService {
    CameraHealthResponse checkCamera(String id);

    void updateStatusCamera(List<CameraHealthReport> reports);
}
