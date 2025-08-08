package com.example.chat_service.controller;

import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.request.FriendRequestRequest;
import com.example.chat_service.dto.response.FriendRequestResponse;
import com.example.chat_service.service.FriendRequestService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("friends")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FriendRequestController {

    FriendRequestService friendRequestService;

    @PostMapping("/request")
    ApiResponse<FriendRequestResponse> sendFriendRequest(@RequestBody @Valid FriendRequestRequest request) {
        return ApiResponse.<FriendRequestResponse>builder()
                .data(friendRequestService.sendFriendRequest(request))
                .build();
    }
}
