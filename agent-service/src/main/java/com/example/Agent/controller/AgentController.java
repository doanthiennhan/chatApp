package com.example.Agent.controller;

import com.example.Agent.dto.CameraToCheck;
import com.example.Agent.service.AgentHealthCheckerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AgentController {
    private final AgentHealthCheckerService checkerService;

    @PostMapping("/check")
    public void checkCameras(@RequestBody List<CameraToCheck> cameraIds) {
        checkerService.process(cameraIds);
    }
}