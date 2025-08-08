package com.example.chat_service.dto.response;

import java.time.Instant;
import java.util.List;

import com.example.chat_service.entity.ParticipantInfo;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
    String id;
    String type;
    String name;
    String participantsHash;
    String conversationAvatar;
    String conversationName;
    List<UserProfileResponse> participants;
    Instant createdDate;
    Instant modifiedDate;
    ChatMessageResponse lastMessage;
    Long unreadCount;
    long memberCount;
}
