package com.example.camera.service.Impl;

import com.example.camera.dto.request.CameraCreateRequest;
import com.example.camera.dto.request.CameraUpdateRequest;
import com.example.camera.dto.response.CameraResponse;
import com.example.camera.dto.response.PageResponse;
import com.example.camera.entity.Camera;
import com.example.camera.exception.AppException;
import com.example.camera.exception.ErrorCode;
import com.example.camera.mappper.CameraMapper;
import com.example.camera.repository.CameraRepository;
import com.example.camera.service.CameraService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CameraServiceImpl implements CameraService {
    private final CameraRepository cameraRepository;
    private final String baseUrl;

    public CameraServiceImpl(CameraRepository cameraRepository, @Value("${app.base-url}") String baseUrl) {
        this.cameraRepository = cameraRepository;
        this.baseUrl = baseUrl;
    }

    @Transactional
    public CameraResponse create(CameraCreateRequest req) {
        if (cameraRepository.existsByRtspUrl(req.getRtspUrl())) {
            throw new AppException(ErrorCode.DUPLICATE_RTSP_URL);
        }
        Camera camera = cameraRepository.save(CameraMapper.toEntity(req));
        String hlsUrl = baseUrl + "/output/" + camera.getId() + "/stream.m3u8";
        camera.setHlsUrl(hlsUrl);
        camera = cameraRepository.save(camera);
        return CameraMapper.toResponse(camera);
    }

    public CameraResponse update(CameraUpdateRequest req) {
        Camera camera = cameraRepository.findById(req.getId())
                .orElseThrow(() -> new AppException(ErrorCode.DUPLICATE_RTSP_URL));
        CameraMapper.update(camera, req);
        return CameraMapper.toResponse(cameraRepository.save(camera));
    }

    public CameraResponse getById(String id) {
        return cameraRepository.findById(id)
                .map(CameraMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CAMERA_NOT_FOUND));
    }

    public PageResponse<CameraResponse> getAll(Pageable pageable) {
        Page<Camera> page = cameraRepository.findAll(pageable);
        return PageResponse.<CameraResponse>builder()
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .data(page.getContent().stream().map(CameraMapper::toResponse).toList())
                .build();
    }

    public void delete(String id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAMERA_NOT_FOUND));
        cameraRepository.delete(camera);
    }

}
