package com.example.camera.controller;

import com.example.camera.dto.request.CameraCreateRequest;
import com.example.camera.dto.request.CameraUpdateRequest;
import com.example.camera.dto.response.ApiResponse;
import com.example.camera.dto.response.CameraResponse;
import com.example.camera.dto.response.PageResponse;
import com.example.camera.service.CameraService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cameras")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CameraController {
    CameraService cameraService;

    @PostMapping
    public ApiResponse<CameraResponse> create(@Valid @RequestBody CameraCreateRequest req) {
        return ApiResponse.<CameraResponse>builder()
                .data(cameraService.create(req))
                .message("Camera created successfully")
                .build();
    }

    @PutMapping
    public ApiResponse<CameraResponse> update(@Valid @RequestBody CameraUpdateRequest req) {
        return ApiResponse.<CameraResponse>builder()
                .data(cameraService.update(req))
                .message("Camera updated successfully")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CameraResponse> getById(@PathVariable String id) {
        return ApiResponse.<CameraResponse>builder()
                .data(cameraService.getById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<PageResponse<CameraResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<PageResponse<CameraResponse>>builder()
                .data(cameraService.getAll(pageable))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        cameraService.delete(id);
        return ApiResponse.<Void>builder()
                .message("Camera deleted successfully")
                .build();
    }
}