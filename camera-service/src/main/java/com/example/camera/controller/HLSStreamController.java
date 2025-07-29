package com.example.camera.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/output")
@RequiredArgsConstructor
public class HLSStreamController {

    @GetMapping("/{cameraId}/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String cameraId,
                                            @PathVariable String fileName) throws IOException {

        Path file = Paths.get("output", cameraId, fileName);
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(file.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(file))
                .body(resource);
    }

    @GetMapping("/{cameraId}/snapshot")
    public ResponseEntity<Resource> getSnapshot(@PathVariable String cameraId) throws IOException {
        Path file = Paths.get("output", cameraId, "snapshot.jpg");
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(file.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, Files.probeContentType(file))
                .body(resource);
    }
}
