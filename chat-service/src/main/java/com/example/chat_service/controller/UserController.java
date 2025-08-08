package com.example.chat_service.controller;

import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.response.UserProfileResponse;
import com.example.chat_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("users")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @GetMapping("/search")
    ApiResponse<List<UserProfileResponse>> searchUsers(@RequestParam("query") String query) {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .data(userService.searchUsers(query))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserProfileResponse>> getAllUsers() {
        return ApiResponse.<List<UserProfileResponse>>builder()
                .data(userService.getAllUsers())
                .build();
    }
}
