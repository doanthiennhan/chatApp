package com.example.chat_service.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.CreateGroupRequest;
import com.example.chat_service.dto.request.GroupMemberActionRequest;
import com.example.chat_service.dto.response.GroupResponse;
import com.example.chat_service.dto.response.MessageResponse;
import com.example.chat_service.dto.response.PageResponse;
import com.example.chat_service.entity.Channel;
import com.example.chat_service.entity.ChannelMember;
import com.example.chat_service.entity.Message;
import com.example.chat_service.repository.ChannelMemberRepository;
import com.example.chat_service.repository.ChannelRepository;
import com.example.chat_service.repository.MessageRepository;
import com.example.chat_service.service.GroupService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GroupServiceImpl implements GroupService {
    @Autowired
    ChannelRepository channelRepository;
    @Autowired
    ChannelMemberRepository channelMemberRepository;
    @Autowired
    MessageRepository messageRepository;
    static final Logger log = LoggerFactory.getLogger(GroupServiceImpl.class);

    @Override
    @Transactional
    public GroupResponse createGroupChat(CreateGroupRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Group name is required");
        }
        if (request.getOwnerId() == null) {
            throw new IllegalArgumentException("OwnerId is required");
        }
        Channel group = new Channel();
        group.setName(request.getName());
        group.setAvatar(request.getAvatar());
        group.setType(Channel.ChannelType.GROUP);
        group.setOwnerId(request.getOwnerId());
        group.setCreatedAt(Instant.now());
        group = channelRepository.save(group);
        // Add owner as admin
        ChannelMember.ChannelMemberId ownerId = new ChannelMember.ChannelMemberId();
        ownerId.channelId = group.getId();
        ownerId.userId = request.getOwnerId();
        ChannelMember ownerMember = new ChannelMember(ownerId, Instant.now(), true);
        List<ChannelMember> members = new ArrayList<>();
        members.add(ownerMember);
        if (request.getMemberIds() != null) {
            for (UUID memberId : request.getMemberIds()) {
                if (!memberId.equals(request.getOwnerId())) {
                    ChannelMember.ChannelMemberId mid = new ChannelMember.ChannelMemberId();
                    mid.channelId = group.getId();
                    mid.userId = memberId;
                    ChannelMember member = new ChannelMember(mid, Instant.now(), false);
                    members.add(member);
                }
            }
        }
        channelMemberRepository.saveAll(members);
        log.info("Created group {} with owner {} and members {}", group.getId(), request.getOwnerId(), members.size());
        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .avatar(group.getAvatar())
                .memberIds(members.stream().map(m -> m.getId().userId).collect(Collectors.toList()))
                .isOwner(true)
                .build();
    }

    @Override
    public PageResponse<MessageResponse> getGroupChatHistory(UUID groupId, int page, int size) {
        Channel group = channelRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (group.getType() != Channel.ChannelType.GROUP) {
            throw new IllegalArgumentException("Not a group channel");
        }
        Page<Message> messagePage = messageRepository.findByChannelIdOrderByCreatedAtAsc(groupId,
                PageRequest.of(page, size));
        List<MessageResponse> content = messagePage.getContent().stream()
                .map(m -> new MessageResponse(m.getMessageId(), m.getSenderId(), groupId, m.getContent(),
                        m.getCreatedAt()))
                .collect(Collectors.toList());
        return PageResponse.<MessageResponse>builder()
                .content(content)
                .pageNumber(messagePage.getNumber())
                .pageSize(messagePage.getSize())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .hasNext(messagePage.hasNext())
                .hasPrevious(messagePage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public GroupResponse addMembersToGroup(AddMembersRequest request) {
        Channel group = channelRepository.findById(request.getGroupId())
                .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (group.getType() != Channel.ChannelType.GROUP) {
            throw new IllegalArgumentException("Not a group channel");
        }
        List<ChannelMember> admins = channelMemberRepository.findByIdChannelId(group.getId())
                .stream().filter(ChannelMember::isIsAdmin).collect(Collectors.toList());
        boolean isAllowed = admins.stream().anyMatch(m -> m.getId().userId.equals(request.getRequesterId()));
        if (!isAllowed) {
            throw new SecurityException("Only owner or admin can add members");
        }
        List<ChannelMember> existing = channelMemberRepository.findByIdChannelId(group.getId());
        Set<UUID> existingIds = existing.stream().map(m -> m.getId().userId).collect(Collectors.toSet());
        List<ChannelMember> toAdd = new ArrayList<>();
        for (UUID memberId : request.getMemberIds()) {
            if (!existingIds.contains(memberId)) {
                ChannelMember.ChannelMemberId mid = new ChannelMember.ChannelMemberId();
                mid.channelId = group.getId();
                mid.userId = memberId;
                ChannelMember member = new ChannelMember(mid, Instant.now(), false);
                toAdd.add(member);
            }
        }
        channelMemberRepository.saveAll(toAdd);
        log.info("Added {} members to group {}", toAdd.size(), group.getId());
        List<ChannelMember> allMembers = channelMemberRepository.findByIdChannelId(group.getId());
        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .avatar(group.getAvatar())
                .memberIds(allMembers.stream().map(m -> m.getId().userId).collect(Collectors.toList()))
                .isOwner(group.getOwnerId().equals(request.getRequesterId()))
                .build();
    }

    @Override
    @Transactional
    public GroupResponse kickMember(GroupMemberActionRequest request) {
        Channel group = channelRepository.findById(request.getGroupId())
                .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (group.getType() != Channel.ChannelType.GROUP) {
            throw new IllegalArgumentException("Not a group channel");
        }
        List<ChannelMember> admins = channelMemberRepository.findByIdChannelId(group.getId())
                .stream().filter(ChannelMember::isIsAdmin).collect(Collectors.toList());
        boolean isAllowed = admins.stream().anyMatch(m -> m.getId().userId.equals(request.getRequesterId()));
        if (!isAllowed) {
            throw new SecurityException("Only owner or admin can kick members");
        }
        ChannelMember.ChannelMemberId mid = new ChannelMember.ChannelMemberId();
        mid.channelId = group.getId();
        mid.userId = request.getTargetUserId();
        channelMemberRepository.deleteById(mid);
        log.info("Kicked user {} from group {}", request.getTargetUserId(), group.getId());
        List<ChannelMember> allMembers = channelMemberRepository.findByIdChannelId(group.getId());
        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .avatar(group.getAvatar())
                .memberIds(allMembers.stream().map(m -> m.getId().userId).collect(Collectors.toList()))
                .isOwner(group.getOwnerId().equals(request.getRequesterId()))
                .build();
    }

    @Override
    @Transactional
    public GroupResponse leaveGroup(GroupMemberActionRequest request) {
        Channel group = channelRepository.findById(request.getGroupId())
                .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (group.getType() != Channel.ChannelType.GROUP) {
            throw new IllegalArgumentException("Not a group channel");
        }
        ChannelMember.ChannelMemberId mid = new ChannelMember.ChannelMemberId();
        mid.channelId = group.getId();
        mid.userId = request.getRequesterId();
        channelMemberRepository.deleteById(mid);
        log.info("User {} left group {}", request.getRequesterId(), group.getId());
        List<ChannelMember> allMembers = channelMemberRepository.findByIdChannelId(group.getId());
        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .avatar(group.getAvatar())
                .memberIds(allMembers.stream().map(m -> m.getId().userId).collect(Collectors.toList()))
                .isOwner(false)
                .build();
    }

    @Override
    @Transactional
    public GroupResponse transferOwner(GroupMemberActionRequest request) {
        Channel group = channelRepository.findById(request.getGroupId())
                .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (group.getType() != Channel.ChannelType.GROUP) {
            throw new IllegalArgumentException("Not a group channel");
        }
        if (!group.getOwnerId().equals(request.getRequesterId())) {
            throw new SecurityException("Only owner can transfer ownership");
        }
        group.setOwnerId(request.getTargetUserId());
        channelRepository.save(group);
        ChannelMember.ChannelMemberId mid = new ChannelMember.ChannelMemberId();
        mid.channelId = group.getId();
        mid.userId = request.getTargetUserId();
        ChannelMember member = channelMemberRepository.findById(mid)
                .orElse(new ChannelMember(mid, Instant.now(), true));
        member.setIsAdmin(true);
        channelMemberRepository.save(member);
        log.info("Transferred ownership of group {} to user {}", group.getId(), request.getTargetUserId());
        List<ChannelMember> allMembers = channelMemberRepository.findByIdChannelId(group.getId());
        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .avatar(group.getAvatar())
                .memberIds(allMembers.stream().map(m -> m.getId().userId).collect(Collectors.toList()))
                .isOwner(true)
                .build();
    }

    @Override
    @Transactional
    public GroupResponse renameGroup(GroupMemberActionRequest request) {
        Channel group = channelRepository.findById(request.getGroupId())
                .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (group.getType() != Channel.ChannelType.GROUP) {
            throw new IllegalArgumentException("Not a group channel");
        }
        if (!group.getOwnerId().equals(request.getRequesterId())) {
            throw new SecurityException("Only owner can rename group");
        }
        group.setName(request.getNewName());
        group.setUpdatedAt(Instant.now());
        channelRepository.save(group);
        log.info("Renamed group {} to {}", group.getId(), request.getNewName());
        List<ChannelMember> allMembers = channelMemberRepository.findByIdChannelId(group.getId());
        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .avatar(group.getAvatar())
                .memberIds(allMembers.stream().map(m -> m.getId().userId).collect(Collectors.toList()))
                .isOwner(group.getOwnerId().equals(request.getRequesterId()))
                .build();
    }

    @Override
    @Transactional
    public GroupResponse setAdmin(GroupMemberActionRequest request) {
        Channel group = channelRepository.findById(request.getGroupId())
                .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (group.getType() != Channel.ChannelType.GROUP) {
            throw new IllegalArgumentException("Not a group channel");
        }
        if (!group.getOwnerId().equals(request.getRequesterId())) {
            throw new SecurityException("Only owner can set admin");
        }
        ChannelMember.ChannelMemberId mid = new ChannelMember.ChannelMemberId();
        mid.channelId = group.getId();
        mid.userId = request.getTargetUserId();
        ChannelMember member = channelMemberRepository.findById(mid)
                .orElseThrow(() -> new NoSuchElementException("Target user is not a member"));
        member.setIsAdmin(Boolean.TRUE.equals(request.getIsAdmin()));
        channelMemberRepository.save(member);
        log.info("Set admin={} for user {} in group {}", request.getIsAdmin(), request.getTargetUserId(),
                group.getId());
        List<ChannelMember> allMembers = channelMemberRepository.findByIdChannelId(group.getId());
        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .avatar(group.getAvatar())
                .memberIds(allMembers.stream().map(m -> m.getId().userId).collect(Collectors.toList()))
                .isOwner(group.getOwnerId().equals(request.getRequesterId()))
                .build();
    }

    @Override
    public PageResponse<GroupResponse> getGroup(int page, int size, String userId) {
        UUID userUUID = UUID.fromString(userId);
        Page<Channel> groupPage = channelRepository.findGroupChannelsByUserId(userUUID, PageRequest.of(page, size));

        List<GroupResponse> content = groupPage.getContent().stream()
                .map(group -> {
                    List<UUID> memberIds = channelMemberRepository.findById_ChannelId(group.getId()).stream()
                            .map(cm -> cm.getId().userId)
                            .collect(Collectors.toList());

                    boolean isOwner = group.getOwnerId() != null && group.getOwnerId().equals(userUUID);

                    return GroupResponse.builder()
                            .groupId(group.getId())
                            .name(group.getName())
                            .avatar(group.getAvatar())
                            .memberIds(memberIds)
                            .isOwner(isOwner)
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.<GroupResponse>builder()
                .content(content)
                .pageNumber(groupPage.getNumber())
                .pageSize(groupPage.getSize())
                .totalElements(groupPage.getTotalElements())
                .totalPages(groupPage.getTotalPages())
                .hasNext(groupPage.hasNext())
                .hasPrevious(groupPage.hasPrevious())
                .build();
    }
}