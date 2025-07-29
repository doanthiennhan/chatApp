package com.example.camera.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraStatusMessage {
    String cameraId;
    String status;
    int viewerCount;
    String name;
    String location;
    String resolution;
    String vendor;
}
