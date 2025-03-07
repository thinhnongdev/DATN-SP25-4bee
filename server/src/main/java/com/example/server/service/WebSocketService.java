package com.example.server.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Gửi thông báo khi hóa đơn được cập nhật
    public void sendInvoiceUpdate(String idHoaDon) {
        messagingTemplate.convertAndSend("/topic/hoa-don", idHoaDon);
    }

    // Gửi thông báo khi sản phẩm trong hóa đơn được cập nhật
    public void sendProductUpdate(String idHoaDon) {
        messagingTemplate.convertAndSend("/topic/hoa-don-san-pham/" + idHoaDon, idHoaDon);
    }

    // Gửi thông báo cập nhật danh sách hóa đơn chờ
    public void sendPendingOrdersUpdate() {
        messagingTemplate.convertAndSend("/topic/hoa-don-cho", "Cập nhật danh sách hóa đơn chờ");
    }
}

