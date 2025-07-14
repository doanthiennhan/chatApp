package com.example.chat_service.repository;

import com.example.chat_service.entity.ChannelMember;
import com.example.chat_service.entity.ChannelMember.ChannelMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConversationParticipantRepository
        extends JpaRepository<ChannelMember, ChannelMemberId> {
    List<ChannelMember> findByIdChannelId(UUID channelId);

    List<ChannelMember> findByIdUserId(UUID userId);
}