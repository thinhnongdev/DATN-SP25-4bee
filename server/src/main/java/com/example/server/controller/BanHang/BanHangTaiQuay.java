package com.example.server.controller.BanHang;

import com.example.server.dto.BanHang.request.PaymentRequest;
import com.example.server.dto.HoaDon.request.AddProductRequest;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.request.PhieuGiamGiaRequest;
import com.example.server.dto.HoaDon.request.UpdateProductQuantityRequest;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.SanPhamChiTietHoaDonResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.exception.ValidationException;
import com.example.server.mapper.impl.HoaDonMapper;
import com.example.server.mapper.impl.SanPhamMapper;
import com.example.server.repository.HoaDon.SanPhamChiTietHoaDonRepository;
import com.example.server.service.BanHang.BanHangService;
import com.example.server.service.BanHang.impl.BanHangServiceImpl;
import com.example.server.service.HoaDon.interfaces.IHoaDonSanPhamService;
import com.example.server.service.HoaDon.interfaces.IHoaDonService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;


import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin/ban-hang")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BanHangTaiQuay {
    @Autowired
    BanHangService banHangService;
    @Autowired
    private BanHangServiceImpl banHangServiceImpl;
    @Autowired
    private IHoaDonService hoaDonService;
    @Autowired
    private HoaDonMapper hoaDonMapper;
    @Autowired
    private IHoaDonSanPhamService hoaDonSanPhamService;
    @Autowired
    private SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
    @Autowired
    private SanPhamMapper sanPhamMapper;

    //key by sepay(thanh toán chuyển khoản)
    private final String API_KEY = "2PCMX4HMSQDAAGE387NJCIZ1ZCYHPVRPJ3ITCILVFKPJTREDMQXE1HFJ56MORW9F";

    @PostMapping("/create")
    public ResponseEntity<HoaDonResponse> createHoaDon(@RequestBody HoaDonRequest request) {
        HoaDonResponse response = banHangService.createHoaDon(request);
        // Đặt trạng thái ban đầu là "Chờ xác nhận"
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{hoaDonId}/add-product")
    public ResponseEntity<HoaDonResponse> addProductToHoaDon(
            @PathVariable String hoaDonId,
            @RequestBody AddProductRequest request) {
        HoaDonResponse response = banHangServiceImpl.addProduct(hoaDonId, request);
        // Tự động áp dụng mã giảm giá tốt nhất sau khi thêm sản phẩm
        response = banHangServiceImpl.applyBestVoucher(hoaDonId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{hoaDonId}/chi-tiet/{hoaDonChiTietId}/so-luong")
    public ResponseEntity<HoaDonResponse> updateProductQuantity(
            @PathVariable String hoaDonId,
            @PathVariable String hoaDonChiTietId,
            @RequestBody UpdateProductQuantityRequest request) {

        log.info("Nhận yêu cầu cập nhật số lượng: HoaDonID={}, ChiTietID={}, SoLuong={}",
                hoaDonId, hoaDonChiTietId, request.getSoLuong());

        if (request.getSoLuong() == null || request.getSoLuong() <= 0) {
            return ResponseEntity.badRequest().body(null);
        }

        HoaDonResponse response = hoaDonSanPhamService.updateProductQuantity(hoaDonId, hoaDonChiTietId, request);

        // Tự động áp dụng mã giảm giá tốt nhất sau khi cập nhật số lượng
        response = banHangServiceImpl.applyBestVoucher(hoaDonId);

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{hoaDonId}/chi-tiet/{hoaDonChiTietId}")
    public ResponseEntity<HoaDonResponse> removeProduct(
            @PathVariable String hoaDonId,
            @PathVariable String hoaDonChiTietId) {

        log.info("Nhận yêu cầu xóa sản phẩm: HoaDonID={}, ChiTietID={}", hoaDonId, hoaDonChiTietId);

        HoaDonResponse response = hoaDonSanPhamService.removeProduct(hoaDonId, hoaDonChiTietId);

        log.info("Sản phẩm đã được xóa thành công!");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sanpham/filter")
    public ResponseEntity<List<SanPhamChiTietHoaDonResponse>> filterProducts(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String chatLieu,
            @RequestParam(required = false) String kieuDang,
            @RequestParam(required = false) String thuongHieu,
            @RequestParam(required = false) String kieuCuc,
            @RequestParam(required = false) String kieuCoAo,
            @RequestParam(required = false) String kieuCoTayAo,
            @RequestParam(required = false) String kieuTayAo,
            @RequestParam(required = false) String kieuTuiAo,
            @RequestParam(required = false) String danhMuc,
            @RequestParam(required = false) String hoaTiet,
            @RequestParam(required = false) String mauSac,
            @RequestParam(required = false) String kichThuoc) {

        List<SanPhamChiTiet> filteredProducts = sanPhamChiTietHoaDonRepository.filterProducts(
                searchTerm, chatLieu, kieuDang, thuongHieu, kieuCuc, kieuCoAo,
                kieuCoTayAo, kieuTayAo, kieuTuiAo, danhMuc, hoaTiet, mauSac, kichThuoc);

        List<SanPhamChiTietHoaDonResponse> response = filteredProducts.stream()
                .map(sanPhamMapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/voucher")
    public ResponseEntity<HoaDonResponse> applyVoucher(
            @PathVariable("id") String hoaDonId,
            @RequestBody PhieuGiamGiaRequest request) {
        log.info("Applying voucher. HoaDonId: {}, VoucherId: {}", hoaDonId, request.getVoucherId());

        if (hoaDonId == null || request.getVoucherId() == null) {
            throw new ValidationException("ID hóa đơn và ID voucher không được để trống");
        }
        return ResponseEntity.ok(banHangServiceImpl.applyVoucher(hoaDonId, request.getVoucherId()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<HoaDonResponse> completeOrder(@PathVariable String id, @RequestBody HoaDonRequest request) {
        HoaDonResponse response = banHangServiceImpl.completeOrder(id, request);
        // In hóa đơn sau khi xác nhận đơn hàng
        ResponseEntity<?> printResponse = printHoaDon(id);
        if (printResponse.getStatusCode() != HttpStatus.OK) {
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.ok(response);
    }


    @GetMapping("/hoadoncho")
    public ResponseEntity<List<HoaDonResponse>> getAllPendingOrders() {
        List<HoaDon> pendingOrders = banHangService.getHoaDonCho();
        List<HoaDonResponse> response = pendingOrders.stream()
                .map(hoaDonMapper::entityToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{hoaDonId}/customer")
    public ResponseEntity<HoaDonResponse> selectCustomer(
            @PathVariable String hoaDonId,
            @RequestBody Map<String, String> request) {

        String customerId = request.get("customerId");
        String diaChiId = request.get("diaChiId"); // Lấy ID địa chỉ từ request

        if (customerId == null) {
            customerId = "Khách hàng lẻ";
        }

        return ResponseEntity.ok(banHangServiceImpl.selectCustomer(hoaDonId, customerId, diaChiId));
    }


    @GetMapping("/{hoaDonId}/san-pham")
    @Operation(summary = "Lấy danh sách sản phẩm trong hóa đơn")
    public ResponseEntity<List<SanPhamChiTietHoaDonResponse>> getProductsInInvoice(
            @PathVariable String hoaDonId
    ) {
        try {
            List<SanPhamChiTietHoaDonResponse> products = hoaDonSanPhamService.getProductsInInvoice(hoaDonId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error fetching products for invoice {}: ", hoaDonId, e);
            throw e;
        }
    }

    @PostMapping("/{hoaDonId}/apply-best-voucher")
    public ResponseEntity<HoaDonResponse> applyBestVoucher(@PathVariable String hoaDonId) {
        return ResponseEntity.ok(banHangServiceImpl.applyBestVoucher(hoaDonId));
    }

    @GetMapping("/{id}/print")
    public ResponseEntity<?> printHoaDon(@PathVariable String id) {
        try {
            log.info("Starting PDF generation for invoice ID: {}", id);

            // Tìm hóa đơn
            HoaDon hoaDon = hoaDonService.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

            // Validate required data
            if (hoaDon.getTongTien() == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Hóa đơn không có thông tin tổng tiền");
            }

            // Tạo file PDF
            byte[] pdfBytes = hoaDonService.generateInvoicePDF(id);

            if (pdfBytes == null || pdfBytes.length == 0) {
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Không thể tạo PDF");
            }

            // Thiết lập headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("inline") // inline: mở trên trình duyệt
                    .filename("hoa-don-" + id + ".pdf")
                    .build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (ResourceNotFoundException e) {
            log.error("Invoice not found: {}", id);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        } catch (Exception e) {
            log.error("Error generating PDF for invoice {}: ", id, e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo PDF: " + e.getMessage());
        }
    }



    @GetMapping("/sepay/transactions")
    public ResponseEntity<Object> getTransactions(
            @RequestParam String account_number,
            @RequestParam int limit) {

        String url = "https://my.sepay.vn/userapi/transactions/list?account_number=" + account_number + "&limit=" + limit;

        RestTemplate restTemplate = new RestTemplate();

        // Thêm Header Authorization
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + API_KEY);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            // Gửi request đến SePay
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            // Kiểm tra xem response có dữ liệu không
            if (response.getBody() == null) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Không có dữ liệu từ SePay");
            }

            // Chuyển đổi JSON string thành Map
            JSONObject jsonResponse = new JSONObject(response.getBody());
            Map<String, Object> responseData = jsonResponse.toMap();

            return ResponseEntity.ok(responseData);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi gọi API SePay: " + e.getMessage());
        }
    }
}
