package com.example.chat_service.service;

import com.example.chat_service.dto.response.ChannelResponse;
import java.util.List;
import java.util.UUID;

public interface ChannelService {
    List<ChannelResponse> getUserChannels(UUID userId);
} 