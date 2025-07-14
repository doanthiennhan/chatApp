
package com.example.chat_service.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "channel_members")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationParticipant {
    @EmbeddedId
    ChannelMemberId id;

    @Column(name = "joined_at", nullable = false)
    Instant joinedAt;

    @Column(name = "is_admin", nullable = false)
    boolean isAdmin = false;

    @Embeddable
    public static class ChannelMemberId implements java.io.Serializable {
        @Column(name = "channel_id", columnDefinition = "uuid")
        UUID channelId;

        @Column(name = "user_id", columnDefinition = "uuid")
        UUID userId;
    }
}