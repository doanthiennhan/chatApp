package com.example.chat_service.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.ConversationRequest;
import com.example.chat_service.dto.response.ConversationResponse;
import com.example.chat_service.service.ConversationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("conversations")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @PostMapping("/create")
    ApiResponse<ConversationResponse> createConversation(@RequestBody @Valid ConversationRequest request) {
        return ApiResponse.<ConversationResponse>builder()
                .data(conversationService.create(request))
                .build();
    }

    @GetMapping("/my-conversations")
    ApiResponse<List<ConversationResponse>> myConversations() {
        return ApiResponse.<List<ConversationResponse>>builder()
                .data(conversationService.myConversations())
                .build();
    }

    @GetMapping("/search")
    ApiResponse<List<ConversationResponse>> searchConversations(@RequestParam("query") String query) {
        return ApiResponse.<List<ConversationResponse>>builder()
                .data(conversationService.searchConversations(query))
                .build();
    }

    @PostMapping("/add-members")
    ApiResponse<ConversationResponse> addMembers(@RequestBody @Valid AddMembersRequest request) {
        return ApiResponse.<ConversationResponse>builder()
                .data(conversationService.addMembers(request))
                .build();
    }

    @DeleteMapping("/{conversationId}/leave")
    ApiResponse<Void> leaveConversation(@PathVariable String conversationId) {
        conversationService.leaveConversation(conversationId);
        return ApiResponse.<Void>builder().build();
    }

    @DeleteMapping("/{conversationId}")
    ApiResponse<Void> deleteConversation(@PathVariable String conversationId) {
        conversationService.deleteConversation(conversationId);
        return ApiResponse.<Void>builder().build();
    }
}
