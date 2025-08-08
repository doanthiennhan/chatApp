package com.example.camera.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Entity
@Table(name = "camera_stream_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraStreamInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @OneToOne
    @JoinColumn(name = "camera_id", nullable = false, unique = true)
    Camera camera;

    String videoCodec;

    String audioCodec;

    @Pattern(regexp = "^\\d{2,5}x\\d{2,5}$", message = "Invalid resolution format")
    String resolution;

    @Pattern(regexp = "^\\d{1,3}(\\.\\d{1,3})?$", message = "Invalid frame rate")
    String frameRate;

    String bitRate;

    String format;

    Instant updatedAt;
}
