package com.example.chat_service.config;

import com.example.chat_service.dto.response.ApiResponse;
import com.example.chat_service.dto.response.IntrospectResponse;
import com.example.chat_service.service.impl.IdentityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {

    private final IdentityService identityService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange.getResponse(), "Missing token");
        }

        String token = authHeader.substring(7);

        return identityService.introspect(token)
                .flatMap(apiResponse -> {
                    IntrospectResponse data = apiResponse.getData();
                    if (data != null && data.isValid()) {
                        return chain.filter(exchange);
                    } else {
                        return unauthorized(exchange.getResponse(), "Invalid token");
                    }
                })
                .onErrorResume(e -> unauthorized(exchange.getResponse(), "Token introspection failed"));
    }

    private Mono<Void> unauthorized(ServerHttpResponse response, String message) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }
}
