package com.example.camera.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import lombok.*;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CameraStreamState {
    Process process;
    AtomicInteger viewerCount = new AtomicInteger(1);

    public static CameraStreamState create(Process process, String cameraId) {
        return new CameraStreamState(process, new AtomicInteger(1));
    }

    public void incrementViewers() {
        viewerCount.incrementAndGet();
    }

    public void decrementViewers() {
        viewerCount.decrementAndGet();
    }

    public int getCurrentViewers() {
        return viewerCount.get();
    }

    public boolean isActive() {
        return process != null && process.isAlive();
    }

    public void stop() {
        if (process != null && process.isAlive()) {
            process.destroy();
        }
    }
}

