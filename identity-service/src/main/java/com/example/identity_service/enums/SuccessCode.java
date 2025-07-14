package com.example.identity_service.enums;

import lombok.Getter;

@Getter
public enum SuccessCode {
    REGISTER_SUCCESS(200, "Register successfully"),
    LOGIN_SUCCESS(200, "Login successfully"),
    SUCCESS(200,"Success"),
    VALID_TOKEN(200,"Token is valid");


    private final int code;
    private final String message;

    SuccessCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}