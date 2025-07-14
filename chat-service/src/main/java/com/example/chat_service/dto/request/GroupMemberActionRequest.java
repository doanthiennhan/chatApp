package com.example.chat_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GroupMemberActionRequest {

    @NotNull(message = "Group ID must not be null")
    UUID groupId;

    @NotNull(message = "Target user ID must not be null")
    UUID targetUserId;

    @NotNull(message = "Requester ID must not be null")
    UUID requesterId;

    @NotBlank(message = "Action must not be blank")
    String action;

    String newName;

    Boolean isAdmin;
}
