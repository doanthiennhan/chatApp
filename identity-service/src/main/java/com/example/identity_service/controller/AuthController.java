package com.example.identity_service.controller;

import com.example.identity_service.dto.request.IntrospectRequest;
import com.example.identity_service.dto.response.*;
import com.example.identity_service.exception.AppException;
import com.example.identity_service.util.CookiesUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.identity_service.dto.request.LoginRequest;
import com.example.identity_service.dto.request.SignUpRequest;
import com.example.identity_service.enums.ErrorCode;
import com.example.identity_service.enums.SuccessCode;
import com.example.identity_service.service.AuthService;
import com.example.identity_service.util.JwtUtil;

import jakarta.validation.Valid;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;
    CookiesUtil cookiesUtil;
    JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ApiResponse<UserResponse> signUp(@RequestBody @Valid SignUpRequest request) {
        return ApiResponse.<UserResponse>builder()
                .code(SuccessCode.REGISTER_SUCCESS.getCode())
                .message(SuccessCode.REGISTER_SUCCESS.getMessage())
                .data(authService.signUp(request))
                .build();
    }

    @PostMapping("/signin")
    public ApiResponse<AuthResponse> signIn(@RequestBody @Valid LoginRequest request, HttpServletResponse httpServletResponse) {
        AuthResponse authResponse = authService.signIn(request);
        cookiesUtil.setToken(httpServletResponse, authResponse.getRefreshToken());

        return ApiResponse.<AuthResponse>builder()
                .code(SuccessCode.LOGIN_SUCCESS.getCode())
                .message((SuccessCode.LOGIN_SUCCESS.getMessage()))
                .data(authResponse)
                .build();
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refreshToken(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
        String refreshToken = cookiesUtil.getTokenFromCookie(httpServletRequest);

        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        AuthResponse authResponse = authService.refreshToken(refreshToken);

        cookiesUtil.removeToken(httpServletResponse);
        cookiesUtil.setToken(httpServletResponse, authResponse.getRefreshToken());

        return ApiResponse.<AuthResponse>builder()
                .code(SuccessCode.SUCCESS.getCode())
                .message(SuccessCode.SUCCESS.getMessage())
                .data(authResponse)
                .build();
    }


    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
            throws ParseException{
        var result = authService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .data(result)
                .build();
    }



}
