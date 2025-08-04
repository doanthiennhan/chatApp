package com.example.identity_service.controller;

import com.example.identity_service.dto.request.IntrospectRequest;
import com.example.identity_service.dto.response.*;
import com.example.identity_service.exception.AppException;
import com.example.identity_service.service.UserService;
import com.example.identity_service.util.CookiesUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

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
    UserService userService;

    @PostMapping("/signup")
    public ApiResponse<UserResponse> signUp(@RequestBody @Valid SignUpRequest request) {
        return ApiResponse.<UserResponse>builder()
                .code(SuccessCode.REGISTER_SUCCESS.getCode())
                .message(SuccessCode.REGISTER_SUCCESS.getMessage())
                .data(authService.signUp(request))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .path("/")
                .httpOnly(true)
                .secure(true)
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ApiResponse.<Void>builder()
                .code(SuccessCode.LOGOUT_SUCCESS.getCode())
                .message(SuccessCode.LOGOUT_SUCCESS.getMessage())
                .build();
    }


    @PostMapping("/signin")
    public ApiResponse<AuthenticationResponse> signIn(@RequestBody @Valid LoginRequest request, HttpServletResponse httpServletResponse) {
        AuthResponse authResponse = authService.signIn(request);
        cookiesUtil.setToken(httpServletResponse, authResponse.getRefreshToken());
        AuthenticationResponse authenticationResponse  = new AuthenticationResponse(authResponse.getAccessToken());

        return ApiResponse.<AuthenticationResponse>builder()
                .code(SuccessCode.LOGIN_SUCCESS.getCode())
                .message((SuccessCode.LOGIN_SUCCESS.getMessage()))
                .data(authenticationResponse)
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
