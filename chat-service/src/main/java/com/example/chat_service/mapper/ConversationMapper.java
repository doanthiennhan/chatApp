package com.example.chat_service.mapper;


import com.example.chat_service.dto.response.ChatMessageResponse;
import com.example.chat_service.dto.response.ConversationResponse;
import com.example.chat_service.entity.Conversation;
import com.example.chat_service.entity.ParticipantInfo;
import com.example.chat_service.mapper.ChatMessageMapper;
import com.example.chat_service.repository.ChatMessageRepository;
import com.example.chat_service.repository.httpClient.ProfileClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
public class ConversationMapper {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageMapper chatMessageMapper;
    private final ProfileClient profileClient;

    public ConversationResponse toResponse(Conversation entity, String currentUserId) {
        if (entity == null) return null;

        ChatMessageResponse lastMessageResponse = null;
        if (entity.getLastMessageId() != null) {
            lastMessageResponse = chatMessageRepository.findById(entity.getLastMessageId())
                    .map(chatMessage -> chatMessageMapper.toResponse(chatMessage, currentUserId))
                    .orElse(null);
        }

        return ConversationResponse.builder()
                .id(entity.getId())
                .type(entity.getType())
                .name(entity.getName())
                .participantsHash(entity.getParticipantsHash())
                .conversationName(entity.getName())
                .conversationAvatar(null)
                .participants(entity.getParticipants().stream()
                        .map(participantInfo -> profileClient.getProfile(participantInfo.getUserId()).getData())
                        .collect(Collectors.toList()))
                .memberCount(entity.getParticipants().size())
                .createdDate(entity.getCreatedDate())
                .modifiedDate(entity.getModifiedDate())
                .lastMessage(lastMessageResponse)
                .unreadCount(entity.getUnreadCount() != null ? entity.getUnreadCount().longValue() : 0)
                .build();
    }

    public Conversation toEntity(ConversationResponse response) {
        if (response == null) return null;

        return Conversation.builder()
                .id(response.getId())
                .type(response.getType())
                .name(response.getName())
                .participantsHash(response.getParticipantsHash())
                .participants(response.getParticipants().stream()
                        .map(userProfileResponse -> new ParticipantInfo(userProfileResponse.getId()))
                        .collect(Collectors.toList()))
                .createdDate(response.getCreatedDate())
                .modifiedDate(response.getModifiedDate())
                .lastMessageId(response.getLastMessage() != null ? response.getLastMessage().getId() : null)
                .unreadCount(response.getUnreadCount() != null ? response.getUnreadCount().intValue() : null)
                .build();
    }

    public List<ConversationResponse> toResponseList(List<Conversation> list, String currentUserId) {
        if (list == null) return null;
        return list.stream()
                .map(conversation -> toResponse(conversation, currentUserId))
                .collect(Collectors.toList());
    }
}
