package com.example.chat_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.CreateGroupRequest;
import com.example.chat_service.dto.request.MessageRequest;
import com.example.chat_service.dto.response.ApiResponse;
import com.example.chat_service.dto.response.ChannelResponse;
import com.example.chat_service.dto.response.GroupResponse;
import com.example.chat_service.dto.response.MessageResponse;
import com.example.chat_service.dto.response.PageResponse;
import com.example.chat_service.enums.SuccessCode;
import com.example.chat_service.service.ChatService;
import com.example.chat_service.service.GroupService;
import com.example.chat_service.service.ChannelService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ChatController {
    @Autowired
    private ChatService chatService;
    @Autowired
    private GroupService groupService;
    @Autowired
    private ChannelService channelService;

    @PostMapping("/send")
    public ApiResponse<MessageResponse> sendMessage(@Valid @RequestBody MessageRequest request) {
        return ApiResponse.<MessageResponse>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(chatService.sendMessage(request))
                .build();
    }

    @PostMapping("/groups")
    public ApiResponse<GroupResponse> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        return ApiResponse.<GroupResponse>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(groupService.createGroupChat(request))
                .build();
    }

    @GetMapping("/history")
    public ApiResponse<PageResponse<MessageResponse>> getChatHistory(
            @RequestParam UUID user1,
            @RequestParam UUID user2,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.<PageResponse<MessageResponse>>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(chatService.getChatHistory(user1, user2, page, size))
                .build();
    }

    @GetMapping("/groups/{groupId}/history")
    public ApiResponse<PageResponse<MessageResponse>> getGroupChatHistory(
            @PathVariable UUID groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.<PageResponse<MessageResponse>>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(groupService.getGroupChatHistory(groupId, page, size))
                .build();
    }

    @GetMapping("/groups")
    public ApiResponse<PageResponse<GroupResponse>> getGroup(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "0") String userId) {
        return ApiResponse.<PageResponse<GroupResponse>>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(groupService.getGroup(page,size,userId))
                .build();
    }

    @GetMapping("/channels")
    public ApiResponse<List<ChannelResponse>> getUserChannels(@RequestParam UUID userId) {
        return ApiResponse.<List<ChannelResponse>>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(channelService.getUserChannels(userId))
                .build();
    }

    @PostMapping("/groups/add-members")
    public ApiResponse<GroupResponse> addMembersToGroup(@Valid @RequestBody AddMembersRequest request) {
        return ApiResponse.<GroupResponse>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(groupService.addMembersToGroup(request))
                .build();
    }
}