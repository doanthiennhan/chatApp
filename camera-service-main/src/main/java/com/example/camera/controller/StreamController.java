package com.example.camera.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
