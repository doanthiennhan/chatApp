package com.example.camera.service.Impl;

import com.example.camera.dto.response.CameraHealthResponse;
import com.example.camera.service.HealthCheckService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HealthCheckServiceImpl implements HealthCheckService {
    public CameraHealthResponse checkCamera(String id){
        return  null;
    }
}
