package com.example.chat_service.service.Impl;

import com.example.chat_service.dto.request.FriendRequestRequest;
import com.example.chat_service.dto.response.FriendRequestResponse;
import com.example.chat_service.entity.FriendRequest;
import com.example.chat_service.exception.AppException;
import com.example.chat_service.exception.ErrorCode;
import com.example.chat_service.mapper.FriendRequestMapper;
import com.example.chat_service.repository.FriendRequestRepository;
import com.example.chat_service.service.FriendRequestService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FriendRequestServiceImpl implements FriendRequestService {

    FriendRequestRepository friendRequestRepository;
    FriendRequestMapper friendRequestMapper;

    @Override
    public FriendRequestResponse sendFriendRequest(FriendRequestRequest request) {
        String requesterId = SecurityContextHolder.getContext().getAuthentication().getName();
        String receiverId = request.getReceiverId();

        if (requesterId.equals(receiverId)) {
            throw new AppException(ErrorCode.INVALID_KEY); // Or a more specific error code
        }

        Optional<FriendRequest> existingRequest = friendRequestRepository.findByRequesterIdAndReceiverId(requesterId, receiverId);
        if (existingRequest.isPresent()) {
            throw new AppException(ErrorCode.INVALID_KEY); // Or a more specific error code like FRIEND_REQUEST_EXISTED
        }

        FriendRequest friendRequest = friendRequestMapper.toEntity(request, requesterId);
        friendRequest = friendRequestRepository.save(friendRequest);

        return friendRequestMapper.toResponse(friendRequest);
    }
}
