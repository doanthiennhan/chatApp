package com.example.chat_service.service.Impl;

import com.example.chat_service.dto.response.UserProfileResponse;
import com.example.chat_service.repository.httpClient.ProfileClient;
import com.example.chat_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {

    ProfileClient profileClient;

    @Override
    public List<UserProfileResponse> searchUsers(String query) {
        return profileClient.searchUsers(query).getData();
    }

    @Override
    public List<UserProfileResponse> getAllUsers() {
        return profileClient.getAllUsers().getData();
    }
}
