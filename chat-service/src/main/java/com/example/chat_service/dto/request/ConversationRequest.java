package com.example.chat_service.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationRequest {
    String type;

    @NotNull(message = "Name not null")
    String name;

    @NotEmpty(message = "Participant IDs cannot be empty")
    @Size(min = 1, message = "At least one participant ID must be provided")
    List<String> participantIds;
}
