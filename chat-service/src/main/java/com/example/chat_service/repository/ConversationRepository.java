package com.example.chat_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.chat_service.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    Optional<Conversation> findByParticipantsHash(String hash);

    @Query("SELECT c FROM Conversation c " + "JOIN c.participants p " + "WHERE p.userId = :userId")
    List<Conversation> findAllByParticipantIdsContains(@Param("userId") String userId);

    @Query("SELECT c FROM Conversation c " +
            "JOIN c.participants p " +
            "WHERE p.userId = :userId AND c.name ILIKE %:query%")
    List<Conversation> findConversationsByUserIdAndNameContainingIgnoreCase(@Param("userId") String userId, @Param("query") String query);
}
