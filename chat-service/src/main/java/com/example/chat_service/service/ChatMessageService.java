package com.example.chat_service.service;

import java.util.List;

import com.example.chat_service.dto.request.ChatMessageRequest;
import com.example.chat_service.dto.response.ChatMessageResponse;
import com.example.chat_service.dto.response.PageResponse;
import com.fasterxml.jackson.core.JsonProcessingException;

public interface ChatMessageService {
    PageResponse<ChatMessageResponse> getMessages(String conversationId, int page, int size);

    ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException;
}
