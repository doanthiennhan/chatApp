package com.example.chat_service.service.Impl;

import com.corundumstudio.socketio.SocketIOServer;
import com.example.chat_service.dto.request.ChatMessageRequest;
import com.example.chat_service.dto.response.ChatMessageResponse;
import com.example.chat_service.dto.response.PageResponse;
import com.example.chat_service.entity.ChatMessage;
import com.example.chat_service.entity.MessageType;
import com.example.chat_service.entity.ParticipantInfo;
import com.example.chat_service.entity.WebSocketSession;
import com.example.chat_service.exception.AppException;
import com.example.chat_service.exception.ErrorCode;
import com.example.chat_service.mapper.ChatMessageMapper;
import com.example.chat_service.repository.ChatMessageRepository;
import com.example.chat_service.repository.ConversationRepository;
import com.example.chat_service.repository.WebSocketSessionRepository;
import com.example.chat_service.repository.httpClient.ProfileClient;
import com.example.chat_service.service.ChatMessageService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageServiceImpl implements ChatMessageService {

    SocketIOServer socketIOServer;
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    WebSocketSessionRepository webSocketSessionRepository;
    ProfileClient profileClient;
    ObjectMapper objectMapper;
    ChatMessageMapper chatMessageMapper;

    @Override
    public PageResponse<ChatMessageResponse> getMessages(String conversationId, int page, int size) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(userId));
        if (!isParticipant) {
            throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page-1, size, Sort.by(Sort.Direction.DESC, "createdDate"));
        Page<ChatMessage> messagePage = chatMessageRepository.findAllByConversationId(conversationId, pageable);

        List<ChatMessageResponse> responses = messagePage.getContent().stream()
                .map(message -> chatMessageMapper.toResponse(message, userId))
                .toList();


        return PageResponse.<ChatMessageResponse>builder()
                .currentPage(page)
                .totalPages(messagePage.getTotalPages())
                .pageSize(size)
                .totalElements(messagePage.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(userId));
        if (!isParticipant) {
            throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
        }

        var profile = profileClient.getProfile(userId).getData();

        ParticipantInfo sender = ParticipantInfo.builder()
                .userId(profile.getId())
                .build();

        ChatMessage message = ChatMessage.builder()
                .conversationId(request.getConversationId())
                .message(request.getMessage())
                .type(MessageType.valueOf(request.getType()))
                .sender(sender)
                .createdDate(Instant.now())
                .build();

        message = chatMessageRepository.save(message);

        conversation.setLastMessageId(message.getId());
        conversation.setModifiedDate(Instant.now());
        conversationRepository.save(conversation);

        sendSocketMessage(conversation.getParticipants(), message, userId);

        return chatMessageMapper.toResponse(message, userId);
    }

    

    private void sendSocketMessage(List<ParticipantInfo> participants, ChatMessage message, String senderId) {
        List<String> userIds = participants.stream()
                .map(ParticipantInfo::getUserId)
                .toList();

        List<WebSocketSession> participantSessions = webSocketSessionRepository.findAllByUserIdIn(userIds);

        ChatMessageResponse baseResponse = chatMessageMapper.toResponse(message, senderId);

        participantSessions.forEach(session -> {

            var client = socketIOServer.getClient(java.util.UUID.fromString(session.getSocketSessionId()));

            if (client != null && client.isChannelOpen()) {
                try {
                    ChatMessageResponse responseForRecipient = new ChatMessageResponse();
                    org.springframework.beans.BeanUtils.copyProperties(baseResponse, responseForRecipient);

                    responseForRecipient.setMe(session.getUserId().equals(senderId));
                    String json = objectMapper.writeValueAsString(responseForRecipient);
                    client.sendEvent("message", json);
                } catch (JsonProcessingException e) {
                    log.error("Failed to serialize message for socket event for client: {}", client.getSessionId(), e);
                }
            }
        });
    }
}
