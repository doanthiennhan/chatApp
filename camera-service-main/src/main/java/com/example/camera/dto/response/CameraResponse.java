package com.example.camera.dto.response;


import com.example.camera.enums.CameraStatus;
import com.example.camera.enums.CameraType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraResponse {
     String id;
     String name;
     String rtspUrl;
     String hlsUrl;
     String snapshotUrl;
     String location;
     CameraType type;
     CameraStatus status;
     String vendor;
     String resolution;
     String codec;
}