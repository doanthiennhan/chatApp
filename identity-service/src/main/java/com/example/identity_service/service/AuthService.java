package com.example.identity_service.service;

import com.example.identity_service.dto.request.IntrospectRequest;
import com.example.identity_service.dto.request.LoginRequest;
import com.example.identity_service.dto.request.SignUpRequest;
import com.example.identity_service.dto.response.AuthResponse;
import com.example.identity_service.dto.response.IntrospectResponse;
import com.example.identity_service.dto.response.UserResponse;

import java.text.ParseException;

public interface AuthService {
    UserResponse signUp(SignUpRequest request);

    AuthResponse signIn(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);

    IntrospectResponse introspect(IntrospectRequest request) throws ParseException;
}