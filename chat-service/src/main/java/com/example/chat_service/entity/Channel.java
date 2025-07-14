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
@Table(name = "channels")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Channel {
    @Id
    @GeneratedValue
    @Column(name = "channel_id", columnDefinition = "uuid")
    UUID id;

    @Column(name = "name", columnDefinition = "text")
    String name;

    @Column(name = "avatar", columnDefinition = "text")
    String avatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    ChannelType type;

    @Column(name = "owner_id", columnDefinition = "uuid")
    UUID ownerId;

    @Column(name = "created_at", nullable = false)
    Instant createdAt;

    @Column(name = "updated_at")
    Instant updatedAt;

    public enum ChannelType {
        DIRECT, GROUP
    }
}