package com.example.fakedataservice.service;

import com.example.fakedataservice.dto.ShelfMetric;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FakeDataService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final List<Integer> shelfIds = List.of(1, 2, 3, 4, 5);

    @Scheduled(fixedRate = 5000)
    public void generateData() {
        for (Integer shelfId : shelfIds) {
            double operatingHours = 8 + Math.random() * 4;
            double shortageHours = Math.random() * operatingHours;
            double osaRate = shortageHours / operatingHours;
            boolean isAlerted = osaRate < 0.85;

            ShelfMetric metric = ShelfMetric.builder()
                    .shelfId(shelfId)
                    .operatingHours(operatingHours)
                    .shortageHours(shortageHours)
                    .osaRate(osaRate)
                    .isAlerted(isAlerted)
                    .timestamp(Instant.now().toString())
                    .build();

            redisTemplate.convertAndSend("shelf-metrics", metric);
        }
    }
}