package com.example.chat_service.controller;

import java.util.List;

import com.example.chat_service.dto.response.PageResponse;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.request.ChatMessageRequest;
import com.example.chat_service.dto.response.ChatMessageResponse;
import com.example.chat_service.service.ChatMessageService;
import com.fasterxml.jackson.core.JsonProcessingException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("messages")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageController {
    ChatMessageService chatMessageService;

    @PostMapping("/create")
    ApiResponse<ChatMessageResponse> create(@RequestBody @Valid ChatMessageRequest request)
            throws JsonProcessingException {
        return ApiResponse.<ChatMessageResponse>builder()
                .data(chatMessageService.create(request))
                .build();
    }

    @GetMapping
    public ApiResponse<PageResponse<ChatMessageResponse>> getMessages(
            @RequestParam String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<PageResponse<ChatMessageResponse>>builder()
                .data(chatMessageService.getMessages(conversationId, page, size))
                .build();
    }
}
