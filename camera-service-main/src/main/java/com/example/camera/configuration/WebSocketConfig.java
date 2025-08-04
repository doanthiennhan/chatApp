package com.example.camera.configuration;

import com.example.camera.metadata.MetadataWebSocketHandler;
import com.example.camera.streaming.StreamWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    private final StreamWebSocketHandler streamHandler;
    private final MetadataWebSocketHandler metadataHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(streamHandler, "/stream")
                .setAllowedOriginPatterns("*");
        registry.addHandler(metadataHandler, "/metadata")
                .setAllowedOriginPatterns("*");
//                .withSockJS();
    }

        
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxBinaryMessageBufferSize(1024 * 1024);
        container.setMaxTextMessageBufferSize(8192);
        container.setMaxSessionIdleTimeout(15 * 60 * 1000L);
        container.setAsyncSendTimeout(5 * 1000L);
        return container;
    }

}