package com.example.phieu_giam_gia.controller;

import com.example.phieu_giam_gia.dto.CreatePhieuGiamGiaRequest;
import com.example.phieu_giam_gia.dto.KhachHangDTO;
import com.example.phieu_giam_gia.dto.PageResponse;
import com.example.phieu_giam_gia.dto.PhieuGiamGiaDTO;
import com.example.phieu_giam_gia.service.KhachHangService;
import com.example.phieu_giam_gia.service.PhieuGiamGiaService;
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
@EnableScheduling
@RestController
@RequestMapping("/api/phieu-giam-gia")
public class PhieuGiamGiaController {

    @Autowired
    private PhieuGiamGiaService service;

    @Autowired
    private KhachHangService khachHangService;


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
            @RequestBody @Valid PhieuGiamGiaDTO dto) {
        PhieuGiamGiaDTO updatedDto = service.update(dto, id);
        return ResponseEntity.ok(updatedDto);
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

}
