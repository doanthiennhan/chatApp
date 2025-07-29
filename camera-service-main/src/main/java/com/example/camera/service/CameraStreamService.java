package com.example.camera.service;

import com.example.camera.dto.request.StreamControlRequest;

import java.io.IOException;

public interface CameraStreamService {

    boolean startStream(StreamControlRequest request);
    boolean stopStream(StreamControlRequest request);


}