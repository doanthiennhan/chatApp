
package com.example.chat_service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.example.chat_service.entity.Channel;

public interface ConversationRepository extends JpaRepository<Channel, UUID> {
    @Query("SELECT c FROM Channel c WHERE c.type = com.example.chat_service.entity.Channel$ChannelType.DIRECT AND c.id IN (SELECT cm.id.channelId FROM ChannelMember cm WHERE cm.id.userId = :user1) AND c.id IN (SELECT cm2.id.channelId FROM ChannelMember cm2 WHERE cm2.id.userId = :user2)")
    Optional<Channel> findDirectChannel(@Param("user1") UUID user1, @Param("user2") UUID user2);
}