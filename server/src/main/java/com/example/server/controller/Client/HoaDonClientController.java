package com.example.server.controller.Client;

import com.example.server.dto.Client.request.CartProductRequest;
import com.example.server.dto.Client.request.LichSuHoaDonClientRequest;
import com.example.server.dto.Client.request.OrderRequest;
import com.example.server.dto.Client.request.OrderUpdateRequest;
import com.example.server.dto.Client.response.HoaDonClientResponse;
import com.example.server.dto.HoaDon.response.LichSuHoaDonResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.LichSuHoaDon;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
import com.example.server.service.Client.HoaDonChiTietClientService;
import com.example.server.service.Client.HoaDonClientService;
import com.example.server.service.HoaDon.impl.LichSuHoaDonService;
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
    @Autowired
    private LichSuHoaDonService lichSuHoaDonService;

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
            System.out.println("Them thanh cong");
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
    @PostMapping("/order/addSanPhamVaoGio")
    public ResponseEntity<?> addSanPhamVaoGio(@RequestBody CartProductRequest cartProductRequest) {
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
            hoaDonClientService.addSanPhamVaoGioHang(cartProductRequest);
            return ResponseEntity.ok("Thêm sản phẩm vào giỏ thành công");
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
    @GetMapping("/order/updatePriceAtAddTime/{idHoaDon}")
    public ResponseEntity<?> UpdateGiaHoaDonChiTiet(@PathVariable String idHoaDon) {
        if (idHoaDon == null || idHoaDon.isEmpty()) {
            return ResponseEntity.badRequest().body("Email khách hàng không được để trống");
        }
        try {
            hoaDonClientService.UpdateHoaDonChoXacNhan(idHoaDon);
            return ResponseEntity.ok("Update thành công hóa đơn");
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
    @GetMapping("/order/findHoaDonByMaHoaDon/{maHoaDon}")
    public ResponseEntity<?> findHoaDonByMaHoaDon(@PathVariable String maHoaDon) {
        if (maHoaDon == null || maHoaDon.isEmpty()) {
            return ResponseEntity.badRequest().body("maHoaDon khách hàng không được để trống");
        }
        try {
            List<HoaDonClientResponse> hoaDon = hoaDonClientService.findHoaDonByMaHoaDon(maHoaDon);
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
    @PutMapping("/order/updatehoadoncho/{id}")
    public ResponseEntity<?> updateHoaDonChoXacNhan(@PathVariable("id") String idHoaDon, @RequestBody OrderUpdateRequest request) {
        if (idHoaDon == null || idHoaDon.isEmpty()) {
            return ResponseEntity.badRequest().body("Id hóa đơn không được để trống");
        }
        try {
            if (hoaDonClientService.findHoaDonClientById(idHoaDon).getTrangThai()==1){//kiểm tra trạng thái của đơn hàng trước khi update phải là chờ xac nhan
            hoaDonClientService.updateDiaChiHoaDonChoXacNhan(request);
            hoaDonClientService.updateHoaDonChiTiet(request);
            hoaDonClientService.handleChenhLechThanhToan(request);
            return ResponseEntity.ok("Cập nhật hóa đơn thành công");
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đơn hàng không được phép sửa");
        }catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi cập nhật hóa đơn" + e.getMessage());
        }

    }
    @DeleteMapping("/huydonchoxacnhan/{id}")
    public ResponseEntity<?> huyDonChoXacNhan(@PathVariable("id")String id, @RequestBody LichSuHoaDonClientRequest lichSuHoaDonClientRequest){
        if (id == null || id.isEmpty()) {
            return ResponseEntity.badRequest().body("Id hóa đơn không được để trống");
        }
        try {
            HoaDon hoaDon = hoaDonClientService.huyHoaDonChoXacNhan(id,lichSuHoaDonClientRequest.getMoTa(),lichSuHoaDonClientRequest.getIdKhachHang());
            return ResponseEntity.ok(hoaDon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi hủy hóa đơn" + e.getMessage());
        }
    }
    @GetMapping("/order/findLichSuHoaDon/{id}")
    public ResponseEntity<?> findLichSuHoaDoById(@PathVariable String id) {
        if (id == null || id.isEmpty()) {
            return ResponseEntity.badRequest().body("Id không được để trống");
        }
        try {
            List<LichSuHoaDonResponse> lichSuHoaDon = lichSuHoaDonService.getByHoaDonId(id);
            return ResponseEntity.ok(lichSuHoaDon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tìm lịch sử hóa đơn" + e.getMessage());
        }
    }
}
