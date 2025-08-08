package com.example.chat_service;

import com.example.chat_service.controller.SocketHandler;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class ChatServiceApplicationTests {

    @MockBean
    private SocketHandler socketHandler;

    @Test
    void contextLoads() {}
}
