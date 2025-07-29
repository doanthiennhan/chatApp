package com.example.camera.service;

import com.example.camera.dto.request.CameraCreateRequest;
import com.example.camera.dto.request.CameraUpdateRequest;
import com.example.camera.dto.response.CameraResponse;
import com.example.camera.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;


public interface CameraService {
    CameraResponse create(CameraCreateRequest req);

    CameraResponse update(CameraUpdateRequest req);

    CameraResponse getById(String id);

    PageResponse<CameraResponse> getAll(Pageable pageable);

    void delete(String id);
}