package com.example.camera.repository;

import com.example.camera.entity.Camera;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CameraRepository extends JpaRepository<Camera,String> {
    boolean existsByRtspUrl(String rtspUrl);
}
