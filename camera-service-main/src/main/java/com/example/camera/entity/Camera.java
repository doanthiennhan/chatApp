package com.example.camera.entity;

import com.example.camera.enums.CameraStatus;
import com.example.camera.enums.CameraType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cameras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Camera {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @NotBlank(message = "Camera name is required")
    String name;

    @NotBlank(message = "RTSP URL is required")
    @Column(nullable = false, unique = true)
    @Pattern(
            regexp = "^(rtsp|http|https)://.*$",
            message = "Must be a valid stream URL (rtsp://, http://, https://)"
    )
    String rtspUrl;

    String hlsUrl;
    
    String snapshotUrl;

    String location;

    @NotNull(message = "Camera status is required")
    CameraStatus status;

    @NotNull(message = "Camera type is required")
    CameraType type;

    String vendor;

    @Pattern(regexp = "^\\d{2,5}x\\d{2,5}$", message = "Resolution must be like 1920x1080")
    String resolution;

    String codec;

    @OneToOne(mappedBy = "camera", cascade = CascadeType.ALL, orphanRemoval = true)
    CameraStreamInfo streamInfo;

    @OneToMany(mappedBy = "camera", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CameraLog> logs = new ArrayList<>();
}