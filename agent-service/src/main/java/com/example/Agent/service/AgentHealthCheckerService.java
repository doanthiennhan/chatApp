package com.example.Agent.service;

import com.example.Agent.dto.CameraToCheck;

import java.util.List;

public interface AgentHealthCheckerService {
    void process(List<CameraToCheck> cameras);
}
