package com.example.server.controller.ThongBao;

import com.example.server.dto.ThongBao.ThongBaoDTO;
import com.example.server.service.HoaDon.impl.LichSuHoaDonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/thong-bao")
@RequiredArgsConstructor
@Tag(name = "Quản lý thông báo", description = "API quản lý thông báo")
@Slf4j
public class ThongBaoController {
    private final LichSuHoaDonService lichSuHoaDonService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo của người dùng hiện tại")
    public ResponseEntity<List<ThongBaoDTO>> getNotifications() {
        return ResponseEntity.ok(lichSuHoaDonService.getNotificationsForCurrentUser());
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Đánh dấu một thông báo đã đọc")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        lichSuHoaDonService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-all-read")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    public ResponseEntity<Void> markAllAsRead() {
        lichSuHoaDonService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc")
    public ResponseEntity<Map<String, Integer>> getUnreadCount() {
        int count = lichSuHoaDonService.getUnreadNotificationsCount();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}