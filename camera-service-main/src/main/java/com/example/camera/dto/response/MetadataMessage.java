package com.example.camera.dto.response;

import lombok.Data;

@Data
public class MetadataMessage {
    private String cameraId;
    private String type;
    private String content;
}