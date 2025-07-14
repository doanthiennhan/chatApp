package com.example.chat_service.enums;

import lombok.Getter;

@Getter
public enum SuccessCode {
    SUCCESS(200,"Success"),
    VALID_TOKEN(200,"Token is valid");


    private final int code;
    private final String message;

    SuccessCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}