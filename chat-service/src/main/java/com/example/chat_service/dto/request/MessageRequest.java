package com.example.chat_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageRequest {
    @NotNull(message = "SenderId is required")
    private UUID senderId;

    @NotNull(message = "ReceiverId is required")
    private UUID receiverId;

    @NotBlank(message = "Content must not be blank")
    private String content;

}