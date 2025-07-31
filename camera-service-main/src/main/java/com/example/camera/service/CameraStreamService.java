package com.example.camera.service;

import com.example.camera.entity.Camera;
import org.springframework.stereotype.Component;

import java.io.IOException;

public interface CameraStreamService {

    void startViewing(String cameraId) throws IOException;

    void stopViewing(String cameraId);

    void saveLastFrame( String cameraId);


}