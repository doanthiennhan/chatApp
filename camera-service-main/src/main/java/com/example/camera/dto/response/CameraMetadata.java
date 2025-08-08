package com.example.camera.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraMetadata {
    String cameraId;
    String fps;
    String resolution;
    String bitrate;
    long uptime;
    String status;
    int viewerCount;
}