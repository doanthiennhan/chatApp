package com.example.camera.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraStatusRequest {

    @NotBlank(message = "Camera ID không được để trống")
    String cameraId;

    @NotBlank(message = "IP address không được để trống")
    String ipAddress;
}