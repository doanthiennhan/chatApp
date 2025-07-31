package com.example.camera.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CameraMetadata {
    private String cameraId;
    private String fps;
    private String resolution;
    private String bitrate;
    private long uptime;
    private String status;
}