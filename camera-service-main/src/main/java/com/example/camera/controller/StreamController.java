package com.example.camera.controller;

import com.example.camera.dto.request.StreamControlRequest;
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

//    CameraStreamService cameraStreamService;
//
//    @PostMapping("/start")
//    public ResponseEntity<?> startStream(@RequestBody StreamControlRequest request) {
//        boolean started = cameraStreamService.startStream(request);
//        return ResponseEntity.ok().body("Stream started: " + started);
//    }
//
//    @PostMapping("/stop")
//    public ResponseEntity<?> stopStream(@RequestBody StreamControlRequest request) {
//        boolean stopped = cameraStreamService.stopStream(request);
//        return ResponseEntity.ok().body("Stream stopped: " + stopped);
//    }


}
