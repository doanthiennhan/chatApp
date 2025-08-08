package com.example.chat_service.repository;

import com.example.chat_service.entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, String> {
    Optional<FriendRequest> findByRequesterIdAndReceiverId(String requesterId, String receiverId);
}
