package com.example.chat_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddMembersRequest {

    @NotNull(message = "Group ID must not be null")
    UUID groupId;

    @NotEmpty(message = "Member list must not be empty")
    List<@NotNull(message = "Member ID cannot be null") UUID> memberIds;

    @NotNull(message = "Requester ID must not be null")
    UUID requesterId;
}
