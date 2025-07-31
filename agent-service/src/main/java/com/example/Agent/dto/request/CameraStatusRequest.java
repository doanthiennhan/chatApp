package com.example.Agent.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CameraStatusRequest {

    @NotBlank(message = "Camera ID không được để trống")
    private String cameraId;

    @NotBlank(message = "IP address không được để trống")
    private String ipAddress;
}