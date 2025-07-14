package com.example.chat_service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.chat_service.entity.Channel;

public interface ChannelRepository extends JpaRepository<Channel, UUID> {
    @Query("SELECT c FROM Channel c WHERE c.type = com.example.chat_service.entity.Channel$ChannelType.DIRECT AND c.id IN (SELECT cm.id.channelId FROM ChannelMember cm WHERE cm.id.userId = :user1) AND c.id IN (SELECT cm2.id.channelId FROM ChannelMember cm2 WHERE cm2.id.userId = :user2)")
    Optional<Channel> findDirectChannel(@Param("user1") UUID user1, @Param("user2") UUID user2);

    @Query("SELECT c FROM Channel c WHERE c.id IN (SELECT cm.id.channelId FROM ChannelMember cm WHERE cm.id.userId = :userId)")
    List<Channel> findAllByUserId(@Param("userId") UUID userId);

    @Query("""
    SELECT c FROM Channel c
    WHERE c.type = 'GROUP' AND c.id IN (
        SELECT cm.id.channelId FROM ChannelMember cm
        WHERE cm.id.userId = :userId
    )
    """)
    Page<Channel> findGroupChannelsByUserId(@Param("userId") UUID userId, Pageable pageable);
}