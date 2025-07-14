package com.example.chat_service.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message {
    @Id
    @GeneratedValue
    @Column(name = "message_id", columnDefinition = "uuid")
    UUID id;

    @Column(name = "channel_id", nullable = false, columnDefinition = "uuid")
    UUID channelId;

    @Column(name = "sender_id", nullable = false, columnDefinition = "uuid")
    UUID senderId;

    @Column(name = "content", columnDefinition = "text")
    String content;

    @Column(name = "created_at", nullable = false)
    Instant createdAt;

    @Column(name = "updated_at")
    Instant updatedAt;

    @Column(name = "is_deleted", nullable = false)
    boolean isDeleted = false;

}