package com.example.identity_service.service.impl;

import com.example.identity_service.dto.response.PageResponse;
import com.example.identity_service.dto.response.UserResponse;
import com.example.identity_service.entity.User;
import com.example.identity_service.enums.ErrorCode;
import com.example.identity_service.exception.AppException;
import com.example.identity_service.mapper.UserMapper;
import com.example.identity_service.repository.UserRepository;
import com.example.identity_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.DialectOverride;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    UserMapper userMapper;

    @Override
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String id = context.getAuthentication().getName();

        User user = userRepository.findById(id).orElseThrow(
                () -> new AppException(ErrorCode.NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getUser(String userId) {
        return userMapper.toUserResponse(
                userRepository.findById(userId)
                        .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND))
        );
    }
    @Override
    public PageResponse<UserResponse> getUsers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("createdAt")));

        Page<User> userPage = userRepository.findByUsernameContainingIgnoreCase(search, pageable);

        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(userMapper::toUserResponse).collect(Collectors.toList());


        return PageResponse.<UserResponse>builder()
                .data(userResponses)
                .currentPage(page)
                .pageSize(size)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();
    }


}
