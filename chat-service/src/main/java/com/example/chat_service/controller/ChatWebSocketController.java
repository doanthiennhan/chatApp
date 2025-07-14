//package com.example.chat_service.controller;
//
//import com.example.chat_service.dto.request.MessageRequest;
//import com.example.chat_service.dto.response.MessageResponse;
//import com.example.chat_service.service.ChatService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.Payload;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Controller;
//
//import java.util.UUID;
//
//@Controller
//public class ChatWebSocketController {
//    @Autowired
//    private ChatService chatService;
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;
//
//    @MessageMapping("/chat.send")
//    public void sendMessage(@Payload MessageRequest messageRequest) {
//        // Kiểm tra quyền gửi trong phòng (chỉ thành viên mới gửi được)
//        UUID senderId = messageRequest.getSenderId();
//        UUID channelId = messageRequest.getReceiverId(); // receiverId là channelId
//        boolean isMember = chatService.getUserChannels(senderId).stream()
//                .anyMatch(c -> c.getChannelId().equals(channelId));
//        if (!isMember) {
//            throw new RuntimeException("Sender is not a member of this channel");
//        }
//        MessageResponse response = chatService.sendMessage(messageRequest);
//        String topic = "/topic/messages." + channelId;
//        messagingTemplate.convertAndSend(topic, response);
//    }
//}