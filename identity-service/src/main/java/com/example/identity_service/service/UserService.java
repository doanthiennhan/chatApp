package com.example.identity_service.service;

import com.example.identity_service.dto.response.PageResponse;
import com.example.identity_service.dto.response.UserResponse;
import org.springframework.stereotype.Service;


public interface UserService {
    UserResponse getMyInfo();

    UserResponse getUser(String id);

    PageResponse<UserResponse> getUsers(int page, int size, String search);
}
