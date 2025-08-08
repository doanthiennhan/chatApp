package com.example.chat_service.service.Impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.ConversationRequest;
import com.example.chat_service.dto.response.UserProfileResponse;
import com.example.chat_service.dto.response.ConversationResponse;
import com.example.chat_service.entity.Conversation;
import com.example.chat_service.entity.ParticipantInfo;
import com.example.chat_service.exception.AppException;
import com.example.chat_service.exception.ErrorCode;
import com.example.chat_service.mapper.ConversationMapper;
import com.example.chat_service.repository.ConversationRepository;
import com.example.chat_service.repository.httpClient.ProfileClient;
import com.example.chat_service.service.ConversationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class ConversationServiceImpl implements ConversationService {
    ConversationRepository conversationRepository;
    ProfileClient profileClient;
    ConversationMapper  mapper;

    @Override
    public List<ConversationResponse> myConversations() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var conversations = conversationRepository.findAllByParticipantIdsContains(userId);
        var response = mapper.toResponseList(conversations, userId);
        response.forEach(conversationResponse -> {
            if(Objects.equals(conversationResponse.getType(), "private")){
                var otherParticipant = conversationResponse.getParticipants().stream()
                        .filter(p -> !p.getId().equals(userId))
                        .findFirst()
                        .orElse(null);
                if(otherParticipant != null){
                    conversationResponse.setConversationName(otherParticipant.getUsername());
                    conversationResponse.setConversationAvatar(otherParticipant.getAvatar());
                }
            }
        });
        return response;
    }

    @Override
    public List<ConversationResponse> searchConversations(String query) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var conversations = conversationRepository.findConversationsByUserIdAndNameContainingIgnoreCase(userId, query);
        var response = mapper.toResponseList(conversations, userId);
        response.forEach(conversationResponse -> {
            if(Objects.equals(conversationResponse.getType(), "private")){
                var otherParticipant = conversationResponse.getParticipants().stream()
                        .filter(p -> !p.getId().equals(userId))
                        .findFirst()
                        .orElse(null);
                if(otherParticipant != null){
                    conversationResponse.setConversationName(otherParticipant.getUsername());
                    conversationResponse.setConversationAvatar(otherParticipant.getAvatar());
                }
            }
        });
        return response;
    }

    @Override
    public ConversationResponse create(ConversationRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<String> allUserIds = new ArrayList<>(request.getParticipantIds());
        allUserIds.add(userId);
        var sortedIds = allUserIds.stream().sorted().toList();
        String hash = generateParticipantHash(sortedIds);

        var conversation = conversationRepository.findByParticipantsHash(hash).orElseGet(() -> {
            List<ParticipantInfo> participants = sortedIds.stream().map(id -> {
                return new ParticipantInfo(id);
            }).toList();

            var newConversation = Conversation.builder()
                    .type(request.getType())
                    .name(request.getName())
                    .participants(participants)
                    .participantsHash(hash)
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .lastMessageId(null)
                    .unreadCount(0)
                    .build();

            return conversationRepository.save(newConversation);
        });

        var response = mapper.toResponse(conversation, userId);
        if(Objects.equals(conversation.getType(), "private")){
            var otherParticipant = response.getParticipants().stream()
                    .filter(p -> !p.getId().equals(userId))
                    .findFirst()
                    .orElse(null);
            if(otherParticipant != null){
                response.setConversationName(otherParticipant.getUsername());
                response.setConversationAvatar(otherParticipant.getAvatar());
            }
        }
        return response;
    }

    @Override
    public ConversationResponse addMembers(AddMembersRequest request) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(currentUserId));
        if (!isParticipant) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Or a more specific error code
        }

        Set<String> existingParticipantIds = conversation.getParticipants().stream()
                .map(ParticipantInfo::getUserId)
                .collect(Collectors.toSet());

        List<String> newUniqueParticipantIds = request.getNewParticipantIds().stream()
                .filter(id -> !existingParticipantIds.contains(id))
                .collect(Collectors.toList());

        if (newUniqueParticipantIds.isEmpty()) {
            return mapper.toResponse(conversation, currentUserId);
        }

        List<ParticipantInfo> newParticipantsInfo = newUniqueParticipantIds.stream().map(id -> {
            return new ParticipantInfo(id);
        }).toList();

        conversation.getParticipants().addAll(newParticipantsInfo);

        // Update participants hash
        List<String> allParticipantIds = conversation.getParticipants().stream()
                .map(ParticipantInfo::getUserId)
                .sorted()
                .toList();
        conversation.setParticipantsHash(generateParticipantHash(allParticipantIds));

        conversation.setModifiedDate(Instant.now());
        conversation = conversationRepository.save(conversation);

        return mapper.toResponse(conversation, currentUserId);
    }

    @Override
    public void leaveConversation(String conversationId) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Check if current user is a participant
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(currentUserId));
        if (!isParticipant) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Or a more specific error code
        }

        // Remove the current user from participants
        conversation.getParticipants().removeIf(p -> p.getUserId().equals(currentUserId));

        if (conversation.getParticipants().isEmpty()) {
            conversationRepository.delete(conversation);
        } else {
            // Update participants hash
            List<String> allParticipantIds = conversation.getParticipants().stream()
                    .map(ParticipantInfo::getUserId)
                    .sorted()
                    .toList();
            conversation.setParticipantsHash(generateParticipantHash(allParticipantIds));

            conversation.setModifiedDate(Instant.now());
            conversationRepository.save(conversation);
        }
    }

    @Override
    public void deleteConversation(String conversationId) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Check if current user is a participant
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(p -> p.getUserId().equals(currentUserId));
        if (!isParticipant) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Or a more specific error code
        }

        // For simplicity, allow any participant to delete a group. 
        // In a real application, this would require creator/admin check.
        conversationRepository.delete(conversation);
    }

    private String generateParticipantHash(List<String> ids) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String joined = String.join("_", ids);
            byte[] hash = digest.digest(joined.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Hash error", e);
        }
    }

    

    
}
