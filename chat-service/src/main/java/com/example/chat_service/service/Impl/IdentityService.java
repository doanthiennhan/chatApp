package com.example.chat_service.service.Impl;

import com.example.chat_service.dto.ApiResponse;
import com.example.chat_service.dto.request.IntrospectRequest;
import com.example.chat_service.dto.response.IntrospectResponse;
import com.example.chat_service.repository.httpClient.IdentityClient;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
//import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IdentityService {
    IdentityClient identityClient;

    public ApiResponse<IntrospectResponse> introspect(String token) {
        return identityClient.introspect(IntrospectRequest.builder().token(token).build());
    }
}