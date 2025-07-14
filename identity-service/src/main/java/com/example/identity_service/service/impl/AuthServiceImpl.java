package com.example.identity_service.service.impl;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.example.identity_service.dto.request.IntrospectRequest;
import com.example.identity_service.dto.response.IntrospectResponse;
import com.example.identity_service.util.CookiesUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.identity_service.dto.request.LoginRequest;
import com.example.identity_service.dto.request.SignUpRequest;
import com.example.identity_service.dto.response.AuthResponse;
import com.example.identity_service.dto.response.UserResponse;
import com.example.identity_service.entity.User;
import com.example.identity_service.enums.ErrorCode;
import com.example.identity_service.enums.Role;
import com.example.identity_service.exception.AppException;
import com.example.identity_service.mapper.UserMapper;
import com.example.identity_service.repository.UserRepository;
import com.example.identity_service.service.AuthService;
import com.example.identity_service.util.JwtUtil;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthServiceImpl implements AuthService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    JwtUtil jwtUtil;
    CookiesUtil cookiesUtil;
    UserMapper userMapper;

    @Override
    public UserResponse signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS); 
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(Role.USER))
                .build();
        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Override
    public AuthResponse signIn(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()->new AppException(ErrorCode.USER_NOT_FOUND));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated)
            throw new AppException(ErrorCode.LOGIN_FAIL);

        String accessToken = jwtUtil.generateAccessToken(user.getUserId().toString(), user.getEmail(), user.getRoles());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId().toString());
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(3600)
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken) || jwtUtil.isTokenExpired(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        String userId = jwtUtil.getUserIdFromToken(refreshToken);
        Optional<User> userOpt = userRepository.findById(UUID.fromString(userId));
        if (userOpt.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        User user = userOpt.get();

        String newAccessToken = jwtUtil.generateAccessToken(user.getUserId().toString(), user.getEmail(),
                user.getRoles());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getUserId().toString());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(3600)
                .build();
    }



    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {

        var token = request.getToken();
        boolean isValid = true;

        try {
            var jwtToken = jwtUtil.validateToken(request.getToken());
        } catch (Exception e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }
}