package com.example.identity_service.controller;

import com.example.identity_service.dto.response.ApiResponse;
import com.example.identity_service.dto.response.PageResponse;
import com.example.identity_service.dto.response.UserResponse;
import com.example.identity_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;

    @GetMapping("/info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .data(userService.getMyInfo())
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .data(userService.getUser(userId))
                .build();
    }

    @GetMapping
    ApiResponse<PageResponse<UserResponse>> getUsers(
            @RequestParam(value = "page",defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "6") int size,
            @RequestParam(value = "search",defaultValue = "") String search
    ){
        return ApiResponse.<PageResponse<UserResponse>>builder()
                .data(userService.getUsers(page, size, search))
                .build();
    }
}
