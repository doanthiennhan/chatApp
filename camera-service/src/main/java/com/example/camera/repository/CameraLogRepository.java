package com.example.camera.repository;

import com.example.camera.entity.CameraLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CameraLogRepository extends JpaRepository<CameraLog, String> {}