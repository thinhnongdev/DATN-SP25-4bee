package com.example.server.controller.Client;

import com.example.server.dto.Client.request.CartProductRequest;
import com.example.server.dto.Client.request.OrderRequest;
import com.example.server.dto.Client.response.HoaDonClientResponse;
import com.example.server.entity.HoaDon;
import com.example.server.service.Client.HoaDonChiTietClientService;
import com.example.server.service.Client.HoaDonClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class HoaDonClientController {
    @Autowired
    HoaDonClientService hoaDonClientService;
    @Autowired
    HoaDonChiTietClientService hoaDonChiTietClientService;

    @PostMapping("/order/createPending")
    public ResponseEntity<?> createCart(@RequestBody OrderRequest orderRequest) {
        if (orderRequest == null || orderRequest.getEmail() == null || orderRequest.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("Email khách hàng không được để trống");
        }
        try {
            HoaDon hoaDon = hoaDonClientService.createCartKhachHangDangNhap(orderRequest.getEmail());
            return ResponseEntity.ok(hoaDon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tạo hóa đơn" + e.getMessage());
        }
    }

    @GetMapping("/order/hoaDonChiTiet/{hoaDonId}")
    public ResponseEntity<?> getHoaDonChiTiet(@PathVariable String hoaDonId) {
//        try {
//            List<HoaDonChiTietClientResponse> chiTietClientResponses = hoaDonChiTietClientService.getHoaDonChiTietList(hoaDonId);
//            if (chiTietClientResponses == null || chiTietClientResponses.isEmpty()) {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy chi tiết hóa đơn cho ID:" + hoaDonId);
//            }
//            return ResponseEntity.ok(chiTietClientResponses);
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi lấy hóa đơn chi tiết:" + e.getMessage());
//        }
        return ResponseEntity.ok(hoaDonChiTietClientService.getHoaDonChiTietList(hoaDonId));
    }

    @PostMapping("/order/addHoaDonChiTiet")
    public ResponseEntity<?> addHoaDonChiTiet(@RequestBody CartProductRequest cartProductRequest) {
        if (cartProductRequest == null) {
            return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ");
        }
        if (cartProductRequest.getEmail() == null || cartProductRequest.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("Email khách hàng không được để trống");
        }
        if (cartProductRequest.getSanPhamChiTiet() == null
                || cartProductRequest.getSanPhamChiTiet().getId() == null
                || cartProductRequest.getSanPhamChiTiet().getQuantity() == null) {
            return ResponseEntity.badRequest().body("Thông tin sản phẩm không hợp lệ");
        }

        try {
            hoaDonClientService.addSanPhamVaoHoaDonChiTiet(cartProductRequest);
            return ResponseEntity.ok("Thêm sản phẩm vào hóa đơn thành công");
        } catch (RuntimeException e) {
            // Ghi log lỗi để dễ debug
            System.err.println("Lỗi khi thêm sản phẩm vào hóa đơn: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi: " + e.getMessage());
        } catch (Exception e) {
            // Ghi log lỗi không mong muốn
            System.err.println("Lỗi không xác định: " + e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
        }
    }

    @GetMapping("/order/findHoaDonPending/{email}")
    public ResponseEntity<?> findHoaDonPending(@PathVariable String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email khách hàng không được để trống");
        }
        try {
            HoaDon hoaDon = hoaDonClientService.findHoaDonDangNhap(email);
            return ResponseEntity.ok(hoaDon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tìm hóa đơn" + e.getMessage());
        }
    }

    @GetMapping("/order/findHoaDon/{email}")
    public ResponseEntity<?> findHoaDon(@PathVariable String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email khách hàng không được để trống");
        }
        try {
            List<HoaDonClientResponse> hoaDon = hoaDonClientService.findHoaDonClient(email);
            return ResponseEntity.ok(hoaDon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tìm hóa đơn" + e.getMessage());
        }
    }
    @GetMapping("/order/findHoaDonById/{id}")
    public ResponseEntity<?> findHoaDoById(@PathVariable String id) {
        if (id == null || id.isEmpty()) {
            return ResponseEntity.badRequest().body("Id không được để trống");
        }
        try {
            HoaDonClientResponse hoaDon = hoaDonClientService.findHoaDonClientById(id);
            return ResponseEntity.ok(hoaDon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tìm hóa đơn" + e.getMessage());
        }
    }

}
