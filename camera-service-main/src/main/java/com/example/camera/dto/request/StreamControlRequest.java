package com.example.camera.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StreamControlRequest {
    String cameraId;
    boolean forceRestart;
}