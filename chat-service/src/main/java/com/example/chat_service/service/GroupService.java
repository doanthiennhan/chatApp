package com.example.chat_service.service;

import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.CreateGroupRequest;
import com.example.chat_service.dto.request.GroupMemberActionRequest;
import com.example.chat_service.dto.response.GroupResponse;
import com.example.chat_service.dto.response.PageResponse;
import com.example.chat_service.dto.response.MessageResponse;

import java.util.UUID;

public interface GroupService {
    GroupResponse createGroupChat(CreateGroupRequest request);
    PageResponse<MessageResponse> getGroupChatHistory(UUID groupId, int page, int size);
    GroupResponse addMembersToGroup(AddMembersRequest request);
    GroupResponse kickMember(GroupMemberActionRequest request);
    GroupResponse leaveGroup(GroupMemberActionRequest request);
    GroupResponse transferOwner(GroupMemberActionRequest request);
    GroupResponse renameGroup(GroupMemberActionRequest request);
    GroupResponse setAdmin(GroupMemberActionRequest request);
    PageResponse<GroupResponse> getGroup( int page, int size, String userId);
} 