package com.example.chat_service.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.chat_service.dto.request.AddMembersRequest;
import com.example.chat_service.dto.request.CreateGroupRequest;
import com.example.chat_service.dto.request.GroupMemberActionRequest;
import com.example.chat_service.dto.request.MessageRequest;
import com.example.chat_service.dto.response.ChannelResponse;
import com.example.chat_service.dto.response.GroupResponse;
import com.example.chat_service.dto.response.MessageResponse;
import com.example.chat_service.dto.response.PageResponse;
import com.example.chat_service.entity.Channel;
import com.example.chat_service.entity.ChannelMember;
import com.example.chat_service.entity.Message;
import com.example.chat_service.repository.ChannelMemberRepository;
import com.example.chat_service.repository.ChannelRepository;
import com.example.chat_service.repository.MessageRepository;
import com.example.chat_service.service.ChatService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatServiceImpl implements ChatService {
    @Autowired
    ChannelRepository channelRepository;
    @Autowired
    ChannelMemberRepository channelMemberRepository;
    @Autowired
    MessageRepository messageRepository;

    static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

    @Override
    public MessageResponse sendMessage(MessageRequest request) {
        UUID senderId = request.getSenderId();
        UUID receiverId = request.getReceiverId();
        String content = request.getContent();
        if (senderId == null || receiverId == null) {
            throw new RuntimeException("Sender or receiver does not exist");
        }
        Optional<Channel> channelOpt = channelRepository.findDirectChannel(senderId, receiverId);
        Channel channel = channelOpt.orElseGet(() -> {
            Channel c = new Channel();
            c.setType(Channel.ChannelType.DIRECT);
            c.setCreatedAt(Instant.now());
            c = channelRepository.save(c);
            ChannelMember.ChannelMemberId id1 = new ChannelMember.ChannelMemberId();
            id1.channelId = c.getId();
            id1.userId = senderId;
            ChannelMember p1 = new ChannelMember(id1, Instant.now(), false);
            ChannelMember.ChannelMemberId id2 = new ChannelMember.ChannelMemberId();
            id2.channelId = c.getId();
            id2.userId = receiverId;
            ChannelMember p2 = new ChannelMember(id2, Instant.now(), false);
            channelMemberRepository.saveAll(Arrays.asList(p1, p2));
            return c;
        });
        boolean isMember = channelMemberRepository.findByIdChannelId(channel.getId())
                .stream().anyMatch(m -> m.getId().userId.equals(senderId));
        if (!isMember) {
            throw new RuntimeException("Sender is not a member of this channel");
        }
        Message message = new Message();
        message.setChannelId(channel.getId());
        message.setSenderId(senderId);
        message.setContent(content);
        message.setCreatedAt(Instant.now());
        message.setDeleted(false);
        Message saved = messageRepository.save(message);
        return new MessageResponse(
                saved.getMessageId(),
                saved.getSenderId(),
                receiverId,
                saved.getContent(),
                saved.getCreatedAt());
    }

    @Override
    public PageResponse<MessageResponse> getChatHistory(UUID user1, UUID user2, int page, int size) {
        Optional<Channel> channelOpt = channelRepository.findDirectChannel(user1, user2);
        if (channelOpt.isEmpty()) {
            return PageResponse.<MessageResponse>builder()
                    .content(Collections.emptyList())
                    .pageNumber(page)
                    .pageSize(size)
                    .totalElements(0)
                    .totalPages(0)
                    .hasNext(false)
                    .hasPrevious(false)
                    .build();
        }
        UUID channelId = channelOpt.get().getId();
        Page<Message> messagePage = messageRepository.findByChannelIdOrderByCreatedAtAsc(channelId,
                PageRequest.of(page, size));
        List<MessageResponse> content = new ArrayList<>();
        for (Message m : messagePage.getContent()) {
            UUID receiverId = m.getSenderId().equals(user1) ? user2 : user1;
            content.add(new MessageResponse(
                    m.getMessageId(),
                    m.getSenderId(),
                    receiverId,
                    m.getContent(),
                    m.getCreatedAt()));
        }
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
}