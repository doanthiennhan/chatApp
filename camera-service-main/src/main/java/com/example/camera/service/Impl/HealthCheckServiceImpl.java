package com.example.camera.service.Impl;

import com.example.camera.dto.CameraHealthReport;
import com.example.camera.dto.response.CameraHealthResponse;
import com.example.camera.entity.Camera;
import com.example.camera.enums.CameraStatus;
import com.example.camera.exception.AppException;
import com.example.camera.exception.ErrorCode;
import com.example.camera.repository.CameraRepository;
import com.example.camera.service.HealthCheckService;
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

    public CameraHealthResponse checkCamera(String id){
        return  null;
    }

    public void updateStatusCamera(List<CameraHealthReport> reports ){
        for(CameraHealthReport report:reports ){
            Camera camera = cameraRepository.findById(report.getCameraId())
                    .orElseThrow(()-> new AppException(ErrorCode.CAMERA_NOT_FOUND));

            camera.setStatus(CameraStatus.valueOf(report.getStatus()));
            cameraRepository.save(camera);
        }
    }


}
