package com.example.chat_service.repository.httpClient;

import com.example.chat_service.configuration.RequestInterceptorConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.response.UserProfileResponse;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "profile-service", url = "http://localhost:8080/identity", configuration = RequestInterceptorConfig.class)
public interface ProfileClient {
    @GetMapping(value = "/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String userId);

    @GetMapping(value = "/users/search", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<UserProfileResponse>> searchUsers(@RequestParam("query") String query);

    @GetMapping(value = "/users", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<List<UserProfileResponse>> getAllUsers();
}