package com.example.server.controller.HoaDon;

import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.dto.HoaDon.response.HoaDonChiTietResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.service.WebSocketService;
import com.example.server.service.HoaDon.interfaces.IHoaDonSanPhamService;
import com.example.server.service.HoaDon.interfaces.ISanPhamHoaDonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/hoa-don")
@RequiredArgsConstructor
@Tag(name = "Quản lý sản phẩm trong hóa đơn")
@Slf4j
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class HoaDonSanPhamController {
    private final IHoaDonSanPhamService hoaDonSanPhamService;
    private final ISanPhamHoaDonService sanPhamService;
    private final WebSocketService webSocketService; // Inject WebSocket Service

    // Endpoint để lấy tất cả sản phẩm có thể thêm vào hóa đơn
    @GetMapping("/san-pham/all")
    @Operation(summary = "Lấy danh sách tất cả sản phẩm")
    public ResponseEntity<List<SanPhamChiTietHoaDonResponse>> getAllProducts() {
        return ResponseEntity.ok(sanPhamService.getAllProducts());
    }

    // Endpoint để lấy sản phẩm trong một hóa đơn cụ thể
    @GetMapping("/{hoaDonId}/san-pham")
    @Operation(summary = "Lấy danh sách sản phẩm trong hóa đơn")
    public ResponseEntity<List<HoaDonChiTietResponse>> getProductsInInvoice(
            @PathVariable String hoaDonId
    ) {
        try {
            List<HoaDonChiTietResponse> products = hoaDonSanPhamService.getProductsInInvoice(hoaDonId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error fetching products for invoice {}: ", hoaDonId, e);
            throw e;
        }
    }

    @PostMapping("/{hoaDonId}/san-pham")
    @Operation(summary = "Thêm sản phẩm vào hóa đơn")
    public ResponseEntity<?> addProduct(
            @PathVariable String hoaDonId,
            @RequestBody AddProductRequest request
    ) {
        log.info("📥 Nhận request: hoaDonId={}, sanPhamChiTietId={}, số lượng={}",
                hoaDonId, request.getSanPhamChiTietId(), request.getSoLuong());

        try {
            HoaDonResponse response = hoaDonSanPhamService.addProduct(hoaDonId, request);
            webSocketService.sendProductUpdate(hoaDonId);
            return ResponseEntity.ok(response);
        } catch (ValidationException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            log.error("Không tìm thấy tài nguyên: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi không xác định khi thêm sản phẩm vào hóa đơn", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống. Vui lòng thử lại sau.");
        }
    }


    @PutMapping("/{hoaDonId}/chi-tiet/{hoaDonChiTietId}/so-luong")
    public ResponseEntity<HoaDonResponse> updateProductQuantity(
            @PathVariable String hoaDonId,
            @PathVariable String hoaDonChiTietId,
            @RequestBody UpdateProductQuantityRequest request) {
        HoaDonResponse response = hoaDonSanPhamService.updateProductQuantity(hoaDonId, hoaDonChiTietId, request);
        webSocketService.sendProductUpdate(hoaDonId); // Gửi sự kiện WebSocket
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{hoaDonId}/chi-tiet/{hoaDonChiTietId}")
    public ResponseEntity<HoaDonResponse> removeProduct(
            @PathVariable String hoaDonId,
            @PathVariable String hoaDonChiTietId) {
        HoaDonResponse response = hoaDonSanPhamService.removeProduct(hoaDonId, hoaDonChiTietId);
        webSocketService.sendProductUpdate(hoaDonId); // Gửi sự kiện WebSocket
        return ResponseEntity.ok(response);
    }
}