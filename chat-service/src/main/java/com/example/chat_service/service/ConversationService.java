package com.example.chat_service.service;

import java.util.List;

import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.ConversationRequest;
import com.example.chat_service.dto.response.ConversationResponse;

public interface ConversationService {
    List<ConversationResponse> myConversations();

    ConversationResponse create(ConversationRequest request);

    List<ConversationResponse> searchConversations(String query);

    ConversationResponse addMembers(AddMembersRequest request);

    void leaveConversation(String conversationId);

    void deleteConversation(String conversationId);
}
