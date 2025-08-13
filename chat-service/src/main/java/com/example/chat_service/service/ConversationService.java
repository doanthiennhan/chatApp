package com.example.chat_service.service;

import java.util.List;

import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.ConversationRequest;
import com.example.chat_service.dto.response.ConversationResponse;
import com.example.chat_service.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

public interface ConversationService {
    PageResponse<ConversationResponse> myConversations(int page, int size, String search);

    ConversationResponse create(ConversationRequest request);

    ConversationResponse addMembers(AddMembersRequest request);

    void leaveConversation(String conversationId);

    void deleteConversation(String conversationId);
}
