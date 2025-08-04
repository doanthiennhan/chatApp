package com.example.identity_service.dto.response;

import com.example.identity_service.enums.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String email;
    String phone;
    String username;
    Role role;
    String avatar;
}
