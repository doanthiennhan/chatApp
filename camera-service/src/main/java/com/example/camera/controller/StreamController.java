package com.example.camera.controller;

import com.example.camera.service.CameraStreamService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StreamController {

    CameraStreamService streamManager;

    @PostMapping("/start-view")
    public ResponseEntity<?> startView(@RequestParam String cameraId) throws IOException {
        streamManager.startViewing(cameraId);
        return ResponseEntity.ok("Started viewing");
    }

    @PostMapping("/stop-view")
    public ResponseEntity<?> stopView(@RequestParam String cameraId) {
        streamManager.stopViewing(cameraId);
        return ResponseEntity.ok("Stopped viewing");
    }


}
