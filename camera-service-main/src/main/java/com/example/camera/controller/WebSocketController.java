//package com.example.camera.controller;
//
//
//import com.example.camera.dto.response.MetadataMessage;
//import lombok.RequiredArgsConstructor;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Controller;
//
//@Controller
//@RequiredArgsConstructor
//public class WebSocketController {
//
//    private final SimpMessagingTemplate messagingTemplate;
//
//    @MessageMapping("/metadata")
//    public void sendMetadata(MetadataMessage message) {
//        messagingTemplate.convertAndSend("/topic/metadata/" + message.getCameraId(), message);
//    }
//}