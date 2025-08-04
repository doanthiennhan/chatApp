package com.example.camera.repository.httpClient;

import com.example.camera.dto.request.CheckCameraRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "agent-service", url = "${agent-service.url}")
public interface AgentServiceClient {

    @PostMapping("/check")
    void checkCamera(@RequestBody List<CheckCameraRequest> requests);

}
