package com.example.chat_service.dto.response;

import java.time.Instant;

import com.example.chat_service.entity.ParticipantInfo;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String id;
    String conversationId;
    boolean me;
    String message;
    String type;
    UserProfileResponse sender;
    Instant createdDate;
}
