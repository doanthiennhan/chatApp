package com.example.camera.dto.request;

import com.example.camera.enums.CameraStatus;
import com.example.camera.enums.CameraType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraCreateRequest {

    @NotBlank(message = "Camera name is required")
    String name;

    @NotBlank(message = "RTSP URL is required")
    @Pattern(regexp = "^(rtsp|http|https)://.*$", message = "Invalid RTSP/HTTP URL")
    String rtspUrl;

    String location;

    @NotNull(message = "Camera type is required")
    CameraType type;

    String vendor;

    @NotNull(message = "Status type is required")
    CameraStatus status;
}