package com.example.chat_service.mapper;


import com.example.chat_service.dto.request.ChatMessageRequest;
import com.example.chat_service.dto.response.ChatMessageResponse;
import com.example.chat_service.entity.ChatMessage;
import com.example.chat_service.entity.MessageType;
import com.example.chat_service.entity.ParticipantInfo;
import com.example.chat_service.repository.httpClient.ProfileClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class ChatMessageMapper {
    private final ProfileClient profileClient;
    public ChatMessageResponse toResponse(ChatMessage entity, String currentUserId) {
        if (entity == null) return null;

        return ChatMessageResponse.builder()
                .id(entity.getId())
                .conversationId(entity.getConversationId())
                .message(entity.getMessage())
                .type(entity.getType().name())
                .sender(profileClient.getProfile(entity.getSender().getUserId()).getData())
                .me(currentUserId != null && entity.getSender() != null && currentUserId.equals(entity.getSender().getUserId()))
                .createdDate(entity.getCreatedDate())
                .build();
    }

    public ChatMessage toEntity(ChatMessageRequest request, ParticipantInfo senderInfo) {
        if (request == null || senderInfo == null) return null;

        return ChatMessage.builder()
                .conversationId(request.getConversationId())
                .message(request.getMessage())
                .type(MessageType.valueOf(request.getType()))
                .sender(senderInfo)
                .createdDate(Instant.now())
                .build();
    }
}

