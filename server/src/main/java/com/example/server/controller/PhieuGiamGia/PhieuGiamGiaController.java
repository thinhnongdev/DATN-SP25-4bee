package com.example.server.controller.PhieuGiamGia;


import com.example.server.dto.PhieuGiamGia.*;
import com.example.server.entity.KhachHang;
import com.example.server.entity.PhieuGiamGiaKhachHang;
import com.example.server.repository.HoaDon.PhieuGiamGiaKhachHangRepository;
import com.example.server.service.PhieuGiamGia.KhachHangService;
import com.example.server.service.PhieuGiamGia.PhieuGiamGiaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@EnableScheduling
@RestController
@RequestMapping("/api/phieu-giam-gia")
public class PhieuGiamGiaController {

    @Autowired
    private PhieuGiamGiaService service;

    @Autowired
    private KhachHangService khachHangService;

    @Autowired
    private PhieuGiamGiaKhachHangRepository pkhachHangRepository;

    @GetMapping
    public List<PhieuGiamGiaDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/khach_hang")
    public List<KhachHangDTO> getAllKhachHang() {
        return khachHangService.getAll();
    }


    @GetMapping("/{id}")
    public ResponseEntity<PhieuGiamGiaDTO> getById(@PathVariable String id) {
        PhieuGiamGiaDTO dto = service.getById(id);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> addPhieuGiamGia(@Valid @RequestBody CreatePhieuGiamGiaRequest request) {
        try {
            PhieuGiamGiaDTO phieuGiamGiaDto = service.addPhieuGiamGia(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(phieuGiamGiaDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<PhieuGiamGiaDTO> update(
            @PathVariable String id,
            @RequestBody @Valid UpdatePhieuGiamGiaRequest request) {
        try {
            // Gọi service để cập nhật phiếu giảm giá và gửi email thông báo
            PhieuGiamGiaDTO updatedDto = service.update(request, id);

            // Trả về ResponseEntity chứa DTO đã cập nhật
            return ResponseEntity.ok(updatedDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }




    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/phan_trang")
    public PageResponse<PhieuGiamGiaDTO> getAllWithPagination(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "5") int pageSize,
            @RequestParam(defaultValue = "ngayTao") String sortBy, // Mặc định là ngayTao
            @RequestParam(defaultValue = "desc") String sortDir) { // Mặc định là giảm dần

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<PhieuGiamGiaDTO> page = service.getAllWithPagination(pageable);
        return new PageResponse<>(page);
    }




    @GetMapping("/info")
    public ResponseEntity<String> getDiscountInfo(@RequestParam String maPhieuGiamGia) {
        try {
            String discountInfo = service.getDiscountInfo(maPhieuGiamGia);
            return ResponseEntity.ok(discountInfo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<Double> applyDiscount(@RequestParam String maPhieuGiamGia,
                                                @RequestParam double tongGiaTriDonHang) {
        try {
            double discountedAmount = service.applyDiscount(maPhieuGiamGia, tongGiaTriDonHang);
            return ResponseEntity.ok(discountedAmount);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

//    @GetMapping("/{maPhieuGiamGia}/khach-hang")
//    public List<KhachHang> getKhachHangByMaPhieuGiamGia(@PathVariable String maPhieuGiamGia) {
//        return service.getKhachHangByMaPhieuGiamGia(maPhieuGiamGia);
//    }

    // Hủy phiếu giảm giá cho khách hàng
//    @PostMapping("/{maPhieuGiamGia}/cancel")
//    public void cancelPhieuGiamGiaForCustomer(@PathVariable String maPhieuGiamGia, @RequestBody String maKhachHang) {
//        service.cancelPhieuGiamGiaForCustomer(maPhieuGiamGia, maKhachHang);
//    }


    @PatchMapping("/{id}/remove-customer/{khachHangId}")
    public ResponseEntity<String> removeCustomerFromVoucher(@PathVariable String id, @PathVariable String khachHangId) {
        service.removeCustomerFromPhieuGiamGia(id, khachHangId);
        return ResponseEntity.ok("Khách hàng đã bị bỏ tích khỏi phiếu giảm giá");
    }


    @PutMapping("/{id}/add-customers")
    public ResponseEntity<?> addCustomersToPhieu(@PathVariable String id, @RequestBody List<String> khachHangIds) {
        service.addCustomerToPhieuGiamGia(id, khachHangIds);
        return ResponseEntity.ok("Thêm khách hàng thành công");
    }


    @GetMapping("/{id}/khach-hang")
    public ResponseEntity<List<KhachHangDTO>> getKhachHangByPhieu(@PathVariable String id) {
        List<PhieuGiamGiaKhachHang> danhSach = pkhachHangRepository.findByPhieuGiamGiaId(id);

        List<KhachHangDTO> response = danhSach.stream().map(item ->
                new KhachHangDTO(
                        item.getKhachHang().getId(),
                        item.getKhachHang().getMaKhachHang(),  // Thêm mã khách hàng
                        item.getKhachHang().getTenKhachHang(),
                        item.getKhachHang().getSoDienThoai(),
                        item.getKhachHang().getEmail(),
                        item.getTrangThai() // Trạng thái áp dụng phiếu
                )
        ).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }



}
