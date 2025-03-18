package com.example.server.controller.Client;

import com.example.server.dto.Client.request.CheckoutRequest;
import com.example.server.dto.Client.request.SanPhamChiTietClientRequest;
import com.example.server.dto.Client.request.ThongTinGiaoHangClientRequest;
import com.example.server.entity.HoaDon;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.service.Client.HoaDonChiTietClientService;
import com.example.server.service.Client.HoaDonClientService;
import com.example.server.service.Client.ThanhToanClientService;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/client/thanhtoan")
public class ThanhToanClientController {
    @Autowired
    ThanhToanClientService thanhToanClientService;
    @Autowired
    HoaDonChiTietClientService hoaDonChiTietClientService;
    @Autowired
    HoaDonClientService hoaDonClientService;


    @Value("${sepay.api.key}") // Lấy giá trị từ application.properties
    private String API_KEY;

    @GetMapping("/sepay/transactions")
    public ResponseEntity<Object> getTransactions(@RequestParam String account_number, @RequestParam int limit) {

        String url = "https://my.sepay.vn/userapi/transactions/list?account_number=" + account_number + "&limit=" + limit;

        RestTemplate restTemplate = new RestTemplate();

        // Thêm Header Authorization
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + API_KEY);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getBody() == null || response.getBody().isEmpty()) {
                log.error("API SePay trả về response rỗng.");
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Không có dữ liệu từ SePay.");
            }

            JSONObject jsonResponse = new JSONObject(response.getBody());
            Map<String, Object> responseData = jsonResponse.toMap();

            return ResponseEntity.ok(responseData);

        } catch (Exception e) {
            log.error("Lỗi khi gọi API SePay: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi gọi API SePay.");
        }
    }
    @PostMapping("/thanhToanDonHangChuaDangNhap")
    public ResponseEntity<?> thanhToanDonHangChuaDangNhap(@RequestBody CheckoutRequest request) {
        try {
            HoaDon hoaDon = hoaDonClientService.createHoaDonClient(
                    request.getThongTinGiaoHang(),
                    request.getTongTienHang(),
                    request.getPhieuGiamGia()
            );
            System.out.println(request.getThongTinGiaoHang().getPhuongThucThanhToan());
            thanhToanClientService.createThanhToanHoaDon(
                    request.getThongTinGiaoHang().getPhuongThucThanhToan(),
                    hoaDon,
                    request.getTongTienThanhToan()
            );
            hoaDonChiTietClientService.addHoaDonChiTiet(request.getSanPhamChiTietList(), hoaDon);

            return ResponseEntity.ok("Đặt hàng thành công!");
        }catch (Exception e) {
            e.printStackTrace(); // In ra log chi tiết lỗi ở terminal backend
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Đặt hàng thất bại: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }
}
