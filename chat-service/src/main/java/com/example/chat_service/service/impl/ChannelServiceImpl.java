package com.example.chat_service.service.impl;

import com.example.chat_service.dto.response.ChannelResponse;
import com.example.chat_service.entity.Channel;
import com.example.chat_service.entity.ChannelMember;
import com.example.chat_service.repository.ChannelMemberRepository;
import com.example.chat_service.repository.ChannelRepository;
import com.example.chat_service.service.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ChannelServiceImpl implements ChannelService {
    @Autowired
    private ChannelRepository channelRepository;
    @Autowired
    private ChannelMemberRepository channelMemberRepository;

    @Override
    public List<ChannelResponse> getUserChannels(UUID userId) {
        List<Channel> channels = channelRepository.findAllByUserId(userId);
        List<ChannelResponse> result = new ArrayList<>();
        for (Channel c : channels) {
            List<ChannelMember> members = channelMemberRepository.findByIdChannelId(c.getId());
            List<UUID> memberIds = new ArrayList<>();
            for (ChannelMember m : members) {
                memberIds.add(m.getId().userId);
            }
            boolean isOwner = !members.isEmpty() && members.get(0).getId().userId.equals(userId);
            result.add(ChannelResponse.builder()
                    .channelId(c.getId())
                    .name(c.getName())
                    .avatar(c.getAvatar())
                    .type(c.getType().name())
                    .memberIds(memberIds)
                    .isOwner(isOwner)
                    .build());
        }
        return result;
    }
} 