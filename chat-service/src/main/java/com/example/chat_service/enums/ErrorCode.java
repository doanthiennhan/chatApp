package com.example.chat_service.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    EMAIL_ALREADY_EXISTS(400, "Email already exists"),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error"),
    UNAUTHENTICATED(401, "Unauthenticated"),
    USER_NOT_FOUND(404, "User not found"),
    INVALID_PASSWORD(401, "Invalid password"),
    NOT_EXISTED(404, "Not existed"),
    LOGIN_FAIL(401, "Incorrect username or password"),
    INVALID_TOKEN(401, "Invalid or expired token");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}