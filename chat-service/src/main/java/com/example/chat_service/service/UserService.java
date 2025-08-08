package com.example.chat_service.service;

import com.example.chat_service.dto.response.UserProfileResponse;

import java.util.List;

public interface UserService {
    List<UserProfileResponse> searchUsers(String query);
    List<UserProfileResponse> getAllUsers();
}
