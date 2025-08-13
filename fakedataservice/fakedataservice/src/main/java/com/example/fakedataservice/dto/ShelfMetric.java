package com.example.fakedataservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShelfMetric {
    private int shelfId;
    private double operatingHours;
    private double shortageHours;
    private double osaRate;
    private boolean isAlerted;
    private String timestamp;
}