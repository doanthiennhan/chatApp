package com.example.camera.service;

import java.io.IOException;

public interface CameraStreamService {

    void startViewing(String cameraId) throws IOException;

    void stopViewing(String cameraId);


}