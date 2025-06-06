package com.example.server.controller.ThongBao;

import com.example.server.dto.ThongBao.ThongBaoDTO;
import com.example.server.service.HoaDon.impl.LichSuHoaDonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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

    @GetMapping("/simple")
    @Operation(summary = "Lấy danh sách thông báo của người dùng hiện tại")
    public ResponseEntity<List<ThongBaoDTO>> getNotificationsSimple() {
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

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo của người dùng hiện tại với phân trang")
    public ResponseEntity<Page<ThongBaoDTO>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ThongBaoDTO> notifications = lichSuHoaDonService.getNotificationsForCurrentUserPaged(page, size);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/all")
    @Operation(summary = "Lấy tất cả thông báo với bộ lọc")
    public ResponseEntity<Page<ThongBaoDTO>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String types,
            @RequestParam(required = false) Boolean read,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        Page<ThongBaoDTO> notifications = lichSuHoaDonService.getAllNotificationsWithFilter(
                page, size, search, types, read, from, to);
        return ResponseEntity.ok(notifications);
    }
}