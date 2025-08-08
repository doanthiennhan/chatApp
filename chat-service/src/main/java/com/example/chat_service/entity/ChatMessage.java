package com.example.chat_service.entity;

import java.time.Instant;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chat_message")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "conversation_id", nullable = false)
    String conversationId;

    @Column(name = "message", nullable = false)
    String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    MessageType type;

    @Embedded
    ParticipantInfo sender;

    @Column(name = "create_date", nullable = false, updatable = false)
    Instant createdDate;
}
