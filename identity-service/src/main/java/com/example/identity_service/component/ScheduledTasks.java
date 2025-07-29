package com.example.identity_service.component;

import com.example.identity_service.entity.InvalidatedToken;
import com.example.identity_service.repository.InvalidatedTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ScheduledTasks {
    InvalidatedTokenRepository invalidatedTokenRepository;

    @Scheduled(fixedDelay = 12, timeUnit = TimeUnit.HOURS)
    public void removeOutDateToken() {
        List<InvalidatedToken> invalidatedTokenList = invalidatedTokenRepository.findByExpiryTimeBefore(new Date());
        if (invalidatedTokenList != null && !invalidatedTokenList.isEmpty()) {
            invalidatedTokenRepository.deleteAll(invalidatedTokenList);
            log.info("Delete Token Invalid in DB");
        }
    }
}
