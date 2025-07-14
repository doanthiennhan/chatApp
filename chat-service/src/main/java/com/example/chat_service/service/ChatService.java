package com.example.chat_service.service;

import com.example.chat_service.dto.request.MessageRequest;
import com.example.chat_service.dto.response.MessageResponse;
import com.example.chat_service.dto.response.PageResponse;
import java.util.UUID;

public interface ChatService {
    MessageResponse sendMessage(MessageRequest request);

    PageResponse<MessageResponse> getChatHistory(UUID user1, UUID user2, int page, int size);
}