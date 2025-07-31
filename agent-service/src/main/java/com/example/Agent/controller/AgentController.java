package com.example.Agent.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AgentController {
    private final CameraStatusCheckerService checkerService;

    @PostMapping("/check")
    public void checkCameras(@RequestBody List<String> cameraIds) {
        checkerService.checkBatch(cameraIds);
    }
}