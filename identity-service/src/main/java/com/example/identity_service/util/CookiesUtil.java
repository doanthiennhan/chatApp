package com.example.identity_service.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CookiesUtil {

    @Value("${jwt.jwt-refresh-expirationMs}")
    private int refreshableDuration;

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String IS_LOGIN_COOKIE_NAME = "isLogin";

    private Cookie createCookie(String name, String value, int maxAge, boolean httpOnly, boolean secure) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setMaxAge(maxAge);
        cookie.setHttpOnly(httpOnly);
        cookie.setSecure(secure);
        return cookie;
    }

    public void setToken(HttpServletResponse response, String refreshToken) {
        Cookie refreshTokenCookie = createCookie(
                REFRESH_TOKEN_COOKIE_NAME,
                refreshToken,
                refreshableDuration,
                true,
                false
        );

        Cookie isLoginCookie = createCookie(
                IS_LOGIN_COOKIE_NAME,
                "true",
                refreshableDuration,
                false,
                false
        );

        response.addCookie(refreshTokenCookie);
        response.addCookie(isLoginCookie);

    }

    public void removeToken(HttpServletResponse response) {
        Cookie refreshTokenCookie = createCookie(
                REFRESH_TOKEN_COOKIE_NAME,
                "",
                0,
                true,
                false
        );

        Cookie isLoginCookie = createCookie(
                IS_LOGIN_COOKIE_NAME,
                "",
                0,
                false,
                false
        );

        response.addCookie(refreshTokenCookie);
        response.addCookie(isLoginCookie);

        log.info("❌ Refresh token and login state cookies removed.");
    }

    public String getTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
