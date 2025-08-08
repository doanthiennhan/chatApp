package com.example.chat_service.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FriendRequestResponse {
    String id;
    String requesterId;
    String receiverId;
    String status;
    Instant createdDate;
    Instant updatedDate;
}
