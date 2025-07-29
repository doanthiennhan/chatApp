package com.example.camera.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraHealthResponse {
    String cameraId;
    String videoCodec;
    String audioCodec;
    String resolution;
    String frameRate;
    String bitRate;
    String format;
    Instant updatedAt;
}
