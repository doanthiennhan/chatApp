package com.example.chat_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Setter
@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "friend_request")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "requester_id", nullable = false)
    String requesterId;

    @Column(name = "receiver_id", nullable = false)
    String receiverId;

    @Column(name = "status", nullable = false)
    String status; // PENDING, ACCEPTED, REJECTED

    @Column(name = "created_date", nullable = false, updatable = false)
    Instant createdDate;

    @Column(name = "updated_date", nullable = false)
    Instant updatedDate;
}
