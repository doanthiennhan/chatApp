package com.example.camera.service.Impl;

import com.example.camera.dto.CameraHealthReport;
import com.example.camera.dto.CameraStatusMessage;
import com.example.camera.dto.response.CameraHealthResponse;
import com.example.camera.entity.Camera;
import com.example.camera.enums.CameraStatus;
import com.example.camera.exception.AppException;
import com.example.camera.exception.ErrorCode;
import com.example.camera.repository.CameraRepository;
import com.example.camera.service.HealthCheckService;
import com.example.camera.status.StatusUpdateWebSocketHandler;
import com.example.camera.streaming.StreamWebSocketHandler;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HealthCheckServiceImpl implements HealthCheckService {
    CameraRepository cameraRepository;
    StatusUpdateWebSocketHandler statusUpdateWebSocketHandler;
    StreamWebSocketHandler streamWebSocketHandler;


    public CameraHealthResponse checkCamera(String id){
        return  null;
    }

    public void updateStatusCamera(List<CameraHealthReport> reports ){
        for(CameraHealthReport report:reports ){
            Camera camera = cameraRepository.findById(report.getCameraId())
                    .orElseThrow(()-> new AppException(ErrorCode.CAMERA_NOT_FOUND));

            CameraStatus newStatus = CameraStatus.valueOf(report.getStatus());
            if (camera.getStatus() != newStatus) {
                camera.setStatus(newStatus);
                cameraRepository.save(camera);

                int viewerCount = streamWebSocketHandler.getViewerCount(camera.getId());
                CameraStatusMessage message = new CameraStatusMessage(
                        camera.getId(),
                        camera.getStatus().name(),
                        viewerCount,
                        camera.getName(),
                        camera.getLocation(),
                        camera.getResolution(),
                        camera.getVendor()
                );
                statusUpdateWebSocketHandler.broadcast(message);
            }
        }
    }


}
