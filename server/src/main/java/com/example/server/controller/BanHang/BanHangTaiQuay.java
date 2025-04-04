package com.example.server.controller.BanHang;

import com.example.server.dto.HoaDon.request.*;
import com.example.server.dto.HoaDon.response.DiaChiResponse;
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
import com.example.server.service.WebSocketService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin/ban-hang")
public class BanHangTaiQuay {
    private final BanHangService banHangService;
    private final BanHangServiceImpl banHangServiceImpl;
    private final IHoaDonService hoaDonService;
    private final HoaDonMapper hoaDonMapper;
    private final IHoaDonSanPhamService hoaDonSanPhamService;
    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;
    private final SanPhamMapper sanPhamMapper;
    @Autowired
    private WebSocketService webSocketService;

    @Value("${sepay.api.key}") // Lấy giá trị từ application.properties
    private String API_KEY;

    public BanHangTaiQuay(BanHangService banHangService, BanHangServiceImpl banHangServiceImpl, IHoaDonService hoaDonService, HoaDonMapper hoaDonMapper, IHoaDonSanPhamService hoaDonSanPhamService, SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository, SanPhamMapper sanPhamMapper) {
        this.banHangService = banHangService;
        this.banHangServiceImpl = banHangServiceImpl;
        this.hoaDonService = hoaDonService;
        this.hoaDonMapper = hoaDonMapper;
        this.hoaDonSanPhamService = hoaDonSanPhamService;
        this.sanPhamChiTietHoaDonRepository = sanPhamChiTietHoaDonRepository;
        this.sanPhamMapper = sanPhamMapper;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createHoaDon(@RequestBody HoaDonRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body("Dữ liệu yêu cầu không được để trống.");
        }
        HoaDonResponse response = banHangService.createHoaDon(request);
        webSocketService.sendPendingOrdersUpdate();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{hoaDonId}/add-product")
    public ResponseEntity<?> addProductToHoaDon(
            @PathVariable String hoaDonId,
            @RequestBody(required = false) AddProductRequest request,
            @RequestParam(defaultValue = "true") boolean delayApplyVoucher
    ) {
        if (request == null) {
            return ResponseEntity.badRequest().body("Dữ liệu sản phẩm không được để trống.");
        }

        HoaDonResponse response = banHangService.addProduct(hoaDonId, request);

        // Nếu không trì hoãn áp dụng voucher, gọi applyBestVoucher nhưng không có customerId
        if (!delayApplyVoucher) {
            response = banHangService.applyBestVoucher(hoaDonId);
        }

        webSocketService.sendInvoiceUpdate(hoaDonId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{hoaDonId}/chi-tiet/{hoaDonChiTietId}/so-luong")
    public ResponseEntity<HoaDonResponse> updateProductQuantity(
            @PathVariable String hoaDonId,
            @PathVariable String hoaDonChiTietId,
            @RequestBody UpdateProductQuantityRequest request) {

        log.info("Nhận yêu cầu cập nhật số lượng: HoaDonID={}, ChiTietID={}, SoLuong={}, CustomerID={}",
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
    public ResponseEntity<HoaDonResponse> removeProduct(@PathVariable String hoaDonId, @PathVariable String hoaDonChiTietId) {

        log.info("Nhận yêu cầu xóa sản phẩm: HoaDonID={}, ChiTietID={}", hoaDonId, hoaDonChiTietId);

        HoaDonResponse response = hoaDonSanPhamService.removeProduct(hoaDonId, hoaDonChiTietId);

        log.info("Sản phẩm đã được xóa thành công!");
        webSocketService.sendInvoiceUpdate(hoaDonId); // Thêm dòng này
        return ResponseEntity.ok(response);
    }

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

    @GetMapping("/sanpham/filter")
    public ResponseEntity<List<SanPhamChiTietHoaDonResponse>> filterProducts(@RequestParam(required = false) String searchTerm, @RequestParam(required = false) String chatLieu, @RequestParam(required = false) String kieuDang, @RequestParam(required = false) String thuongHieu, @RequestParam(required = false) String kieuCuc, @RequestParam(required = false) String kieuCoAo, @RequestParam(required = false) String kieuCoTayAo, @RequestParam(required = false) String kieuTayAo, @RequestParam(required = false) String kieuTuiAo, @RequestParam(required = false) String danhMuc, @RequestParam(required = false) String hoaTiet, @RequestParam(required = false) String mauSac, @RequestParam(required = false) String kichThuoc) {

        List<SanPhamChiTiet> filteredProducts = sanPhamChiTietHoaDonRepository.filterProducts(searchTerm, chatLieu, kieuDang, thuongHieu, kieuCuc, kieuCoAo, kieuCoTayAo, kieuTayAo, kieuTuiAo, danhMuc, hoaTiet, mauSac, kichThuoc);

        List<SanPhamChiTietHoaDonResponse> response = filteredProducts.stream().map(sanPhamMapper::toResponse).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/voucher")
    public ResponseEntity<HoaDonResponse> applyVoucher(@PathVariable("id") String hoaDonId, @RequestBody PhieuGiamGiaRequest request) {
        log.info("Applying voucher. HoaDonId: {}, VoucherId: {}", hoaDonId, request.getVoucherId());

        if (hoaDonId == null || request.getVoucherId() == null) {
            throw new ValidationException("ID hóa đơn và ID voucher không được để trống");
        }

        return ResponseEntity.ok(banHangServiceImpl.applyVoucher(hoaDonId, request.getVoucherId()));
    }

    @PostMapping("/{hoaDonId}/complete")
    public ResponseEntity<HoaDonResponse> completeOrder(@PathVariable String hoaDonId, @RequestBody HoaDonRequest request) {
        if (request.getThanhToans() == null || request.getThanhToans().isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        HoaDonResponse response = banHangServiceImpl.completeOrder(hoaDonId, request);

        // In hóa đơn sau khi xác nhận đơn hàng
        ResponseEntity<?> printResponse = printHoaDon(hoaDonId);
        if (printResponse.getStatusCode() != HttpStatus.OK) {
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(response);
    }


    @GetMapping("/hoadontaiquay")
    public ResponseEntity<?> getAllPendingOrders() {
        try {
            List<HoaDon> pendingOrders = banHangService.getHoaDonTaiQuay();
            List<HoaDonResponse> response = pendingOrders.stream().map(hoaDonMapper::entityToResponse).collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching pending orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi lấy danh sách hóa đơn chờ: " + e.getMessage());
        }
    }


    @PutMapping("/{hoaDonId}/customer")
    public ResponseEntity<HoaDonResponse> selectCustomer(@PathVariable String hoaDonId, @RequestBody Map<String, String> request) {

        String customerId = request.get("customerId");
        String diaChiId = request.get("diaChiId"); // Lấy ID địa chỉ từ request

        if (customerId == null) {
            customerId = "Khách hàng lẻ";
        }

        return ResponseEntity.ok(banHangServiceImpl.selectCustomer(hoaDonId, customerId, diaChiId));
    }

    @GetMapping("/{hoaDonId}/dia-chi-chi-tiet")
    public ResponseEntity<Map<String, String>> getAddressDetails(@PathVariable String hoaDonId) {
        Map<String, String> addressParts = banHangServiceImpl.getDiaChiGiaoHang(hoaDonId);
        return ResponseEntity.ok(addressParts);
    }

    @PutMapping("/{hoaDonId}/update-address")
    public ResponseEntity<HoaDonResponse> updateDiaChiGiaoHang(
            @PathVariable String hoaDonId,
            @RequestBody UpdateDiaChiRequest addressRequest) {

        if (hoaDonId == null || addressRequest == null || addressRequest.getDiaChiId() == null) {
            log.error("Dữ liệu không hợp lệ: thiếu hoaDonId hoặc diaChiId.");
            return ResponseEntity.badRequest().body(null);
        }

        try {
            HoaDonResponse response = banHangServiceImpl.updateDiaChiGiaoHang(hoaDonId, addressRequest);
            log.info("Cập nhật địa chỉ giao hàng thành công cho hóa đơn: {}", hoaDonId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi server khi cập nhật địa chỉ: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    @PutMapping("/{hoaDonId}/update-loai-hoa-don")
    public ResponseEntity<?> updateLoaiHoaDon(@PathVariable String hoaDonId, @RequestBody Map<String, Integer> request) {
        Integer loaiHoaDon = request.get("loaiHoaDon");

        if (loaiHoaDon == null) {
            return ResponseEntity.badRequest().body("Loại hóa đơn không được để trống.");
        }

        banHangService.updateLoaiHoaDon(hoaDonId, loaiHoaDon);
        return ResponseEntity.ok("Cập nhật hình thức mua hàng thành công.");
    }

    @GetMapping("/{hoaDonId}/san-pham")
    @Operation(summary = "Lấy danh sách sản phẩm trong hóa đơn")
    public ResponseEntity<List<SanPhamChiTietHoaDonResponse>> getProductsInInvoice(@PathVariable String hoaDonId) {
        try {
            List<SanPhamChiTietHoaDonResponse> products = hoaDonSanPhamService.getProductsInInvoice(hoaDonId);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Lỗi khi lấy sản phẩm trong hóa đơn: ", hoaDonId, e);
            throw e;
        }
    }

    @PostMapping("/{hoaDonId}/apply-best-voucher")
    public ResponseEntity<HoaDonResponse> applyBestVoucher(
            @PathVariable String hoaDonId,
            @RequestParam String customerId // Nhận thêm customerId
    ) {
        return ResponseEntity.ok(banHangServiceImpl.applyBestVoucher(hoaDonId, customerId));
    }


    @GetMapping("/{id}/print")
    public ResponseEntity<?> printHoaDon(@PathVariable String id) {
        try {
            log.info("Starting PDF generation for invoice ID: {}", id);

            // Tìm hóa đơn
            HoaDon hoaDon = hoaDonService.findById(id).orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại với id: " + id));

            // Validate required data
            if (hoaDon.getTongTien() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Hóa đơn không có thông tin tổng tiền");
            }

            // Tạo file PDF
            byte[] pdfBytes = hoaDonService.generateInvoicePDF(id);

            if (pdfBytes == null || pdfBytes.length == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Không thể tạo PDF");
            }

            // Thiết lập headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.builder("inline") // inline: mở trên trình duyệt
                    .filename("hoa-don-" + id + ".pdf").build());

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (ResourceNotFoundException e) {
            log.error("Invoice not found: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error generating PDF for invoice {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi tạo PDF: " + e.getMessage());
        }
    }
}
