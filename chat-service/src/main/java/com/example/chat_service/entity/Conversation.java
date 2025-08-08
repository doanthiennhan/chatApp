package com.example.chat_service.entity;

import java.time.Instant;
import java.util.List;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "conversation")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column
    String  name;

    @Column(name = "type", nullable = false)
    String type;

    @Column
    String participantsHash;

    @ElementCollection
    @CollectionTable(name = "conversation_participants", joinColumns = @JoinColumn(name = "conversation_id"))
    @Column(name = "participant_info")
    List<ParticipantInfo> participants;

    @Column(name = "create_date", nullable = false, updatable = false)
    Instant createdDate;

    @Column(name = "modified_date", nullable = false)
    Instant modifiedDate;

    @Column(name = "last_message_id")
    String lastMessageId;

    @Column(name = "unread_count")
    Integer unreadCount;
}
