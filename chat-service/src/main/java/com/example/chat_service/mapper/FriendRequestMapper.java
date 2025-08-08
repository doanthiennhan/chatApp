package com.example.chat_service.mapper;

import com.example.chat_service.dto.request.FriendRequestRequest;
import com.example.chat_service.dto.response.FriendRequestResponse;
import com.example.chat_service.entity.FriendRequest;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class FriendRequestMapper {

    public FriendRequest toEntity(FriendRequestRequest request, String requesterId) {
        if (request == null) return null;
        return FriendRequest.builder()
                .requesterId(requesterId)
                .receiverId(request.getReceiverId())
                .status("PENDING")
                .createdDate(Instant.now())
                .updatedDate(Instant.now())
                .build();
    }

    public FriendRequestResponse toResponse(FriendRequest entity) {
        if (entity == null) return null;
        return FriendRequestResponse.builder()
                .id(entity.getId())
                .requesterId(entity.getRequesterId())
                .receiverId(entity.getReceiverId())
                .status(entity.getStatus())
                .createdDate(entity.getCreatedDate())
                .updatedDate(entity.getUpdatedDate())
                .build();
    }
}
