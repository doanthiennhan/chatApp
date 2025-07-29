package com.example.camera.entity;

import com.example.camera.enums.CameraStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "camera_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CameraLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camera_id", nullable = false)
    private Camera camera;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CameraStatus status;

    private String message;

    @NotNull
    private Instant timestamp;
}