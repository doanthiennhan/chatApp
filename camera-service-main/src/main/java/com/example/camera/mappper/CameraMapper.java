package com.example.camera.mappper;

import com.example.camera.dto.request.CameraCreateRequest;
import com.example.camera.dto.request.CameraUpdateRequest;
import com.example.camera.dto.response.CameraResponse;
import com.example.camera.entity.Camera;

public class CameraMapper {

    public static Camera toEntity(CameraCreateRequest req) {
        return Camera.builder()
                .name(req.getName())
                .rtspUrl(req.getRtspUrl())
                .location(req.getLocation())
                .type(req.getType())
                .vendor(req.getVendor())
                .status(req.getStatus())
                .build();
    }

    public static CameraResponse toResponse(Camera camera) {
        return CameraResponse.builder()
                .id(camera.getId())
                .name(camera.getName())
                .rtspUrl(camera.getRtspUrl())
                .hlsUrl(camera.getHlsUrl())
                .snapshotUrl(camera.getSnapshotUrl())
                .location(camera.getLocation())
                .type(camera.getType())
                .status(camera.getStatus())
                .vendor(camera.getVendor())
                .resolution(camera.getResolution())
                .codec(camera.getCodec())
                .build();
    }

    public static void update(Camera camera, CameraUpdateRequest req) {
        camera.setName(req.getName());
        camera.setRtspUrl(req.getRtspUrl());
        camera.setLocation(req.getLocation());
        camera.setType(req.getType());
        camera.setVendor(req.getVendor());
        camera.setStatus(req.getStatus());
    }
}
