package com.example.chat_service.repository.httpClient;

import com.example.chat_service.configuration.RequestInterceptorConfig;
import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.request.IntrospectRequest;
import com.example.chat_service.dto.response.IntrospectResponse;
import com.example.chat_service.dto.response.UserProfileResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(
        name = "identity-service",
        url = "${app.services.identity.url}",
        configuration = {RequestInterceptorConfig.class}
)
public interface IdentityClient {

    @PostMapping(value = "/api/auth/introspect", consumes = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request);

    @GetMapping(value = "/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<UserProfileResponse> getProfile(@PathVariable("userId") String userId);
}
