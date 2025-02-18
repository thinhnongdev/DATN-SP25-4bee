package com.example.server.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendInvoiceUpdate(String idHoaDon) {
        messagingTemplate.convertAndSend("/topic/hoa-don", idHoaDon);
    }
    public void sendProductUpdate(String idHoaDon) {
        messagingTemplate.convertAndSend("/topic/hoa-don-san-pham/" + idHoaDon, idHoaDon);
    }
}
