package com.example.chat_service.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "message_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageStatus {
    @EmbeddedId
    MessageStatusId id;

    @Column(name = "is_read", nullable = false)
    boolean isRead = false;

    @Column(name = "read_at")
    Instant readAt;

    @Embeddable
    public static class MessageStatusId implements java.io.Serializable {
        @Column(name = "message_id", columnDefinition = "uuid")
        UUID messageId;

        @Column(name = "user_id", columnDefinition = "uuid")
        UUID userId;
    }
}