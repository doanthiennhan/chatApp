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
@Table(name = "web_socket_session")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WebSocketSession {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "socket_session_id", nullable = false)
    String socketSessionId;

    @Column
    String userId;

    @Column(name = "create_at", nullable = false, updatable = false)
    Instant createdAt;
}
