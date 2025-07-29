package com.example.camera.service;

import com.example.camera.dto.response.CameraHealthResponse;

public interface HealthCheckService {
    CameraHealthResponse checkCamera(String id);
}
