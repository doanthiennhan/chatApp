package com.example.identity_service.mapper;

import java.util.Set;

import org.springframework.stereotype.Component;

import com.example.identity_service.dto.request.SignUpRequest;
import com.example.identity_service.dto.response.UserResponse;
import com.example.identity_service.entity.User;
import com.example.identity_service.enums.Role;

@Component
public class UserMapper {
    public User toUser(SignUpRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRoles(Set.of(Role.USER));
        return user;
    }

    public UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getUserId() != null ? user.getUserId().toString() : null);
        response.setEmail(user.getEmail());
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            response.setRole(user.getRoles().iterator().next());
        }
        return response;
    }
}
