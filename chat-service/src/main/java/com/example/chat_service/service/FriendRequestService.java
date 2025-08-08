package com.example.chat_service.service;

import com.example.chat_service.dto.request.FriendRequestRequest;
import com.example.chat_service.dto.response.FriendRequestResponse;

public interface FriendRequestService {
    FriendRequestResponse sendFriendRequest(FriendRequestRequest request);
}
