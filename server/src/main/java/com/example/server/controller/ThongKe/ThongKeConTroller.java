package com.example.server.controller.ThongKe;

import com.example.server.dto.HoaDon.HoaDonDTO.HoaDonDTO;
import com.example.server.dto.HoaDon.HoaDonDTO.ThongKeSoLuongDTO;
import com.example.server.service.ThongKe.ThongKeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/thong-ke")
@CrossOrigin(origins = "http://localhost:3000")
public class ThongKeConTroller {


    @Autowired
    private ThongKeService service;

    // API lấy doanh thu ngày hiện tại
    @GetMapping("/doanh-thu-ngay")
    public ResponseEntity<Map<String, Object>> getDoanhThuNgay() {
        return ResponseEntity.ok(service.getThongKeDoanhThuNgay());
    }

    // API lấy doanh thu tuần hiện tại
    @GetMapping("/doanh-thu-tuan")
    public ResponseEntity<Map<String, Object>> getDoanhThuTuan() {
        return ResponseEntity.ok(service.getThongKeDoanhThuTuan());
    }

    // API lấy doanh thu tháng hiện tại
    @GetMapping("/doanh-thu-thang")
    public ResponseEntity<Map<String, Object>> getDoanhThuThang() {
        return ResponseEntity.ok(service.getThongKeDoanhThuThang());
    }

    // API lấy doanh thu năm hiện tại
    @GetMapping("/doanh-thu-nam")
    public ResponseEntity<Map<String, Object>> getDoanhThuNam() {
        return ResponseEntity.ok(service.getThongKeDoanhThuNam());
    }
    //trạng thái đơn hàng
    @GetMapping("/statistics")
    public ResponseEntity<List<HoaDonDTO>> getOrderStatistics() {
        return ResponseEntity.ok(service.getOrderStatistics());
    }
    // số lượng sản phẩm bán ra
    @GetMapping("/so-luong-ban")
    public ResponseEntity<List<ThongKeSoLuongDTO>> getSoLuongSanPhamBan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate) {
        List<ThongKeSoLuongDTO> data = service.getSoLuongSanPhamBanTheoNgay(startDate, endDate);
        return ResponseEntity.ok(data);
    }
    @GetMapping("/soluong-homnay")
    public Map<String, Object> getSoLuongHomNay() {
        return service.getSoLuongSanPhamHomNay();
    }

    @GetMapping("/so-luong-theo-thang")
    public ResponseEntity<Map<String, Object>> getSoLuongSanPhamTheoThang() {
        Map<String, Object> response = service.getSoLuongSanPhamTheoThang();
        return ResponseEntity.ok(response);
    }


    @GetMapping("/so-luong-theo-nam")
    public ResponseEntity<List<Map<String, Object>>> getThongKeSoLuongSanPhamTheoNam() {
        List<Map<String, Object>> response = service.getThongKeSoLuongSanPhamTheoNam();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doanh-thu")
    public ResponseEntity<List<Map<String, Object>>> getDoanhThuTheoKhoangNgay(
            @RequestParam("start") String start,
            @RequestParam("end") String end) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date startDate = sdf.parse(start);
            Date endDate = sdf.parse(end);

            List<Map<String, Object>> response = service.getDoanhThuTheoKhoangNgay(startDate, endDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/doanh-thu-hom-nay")
    public ResponseEntity<Map<String, Object>> getDoanhThuHomNay() {
        return ResponseEntity.ok(service.getDoanhThuHomNay());
    }


    @GetMapping("/doanh-thu-thang-cot")
    public ResponseEntity<List<Map<String, Object>>> getDoanhThuTheoNgayTrongThang() {
        return ResponseEntity.ok(service.getDoanhThuTheoNgayTrongThang());
    }


    @GetMapping("/doanh-thu-cac-thang-trong-nam")
    public List<Map<String, Object>> getDoanhThuTheoThangTrongNam() {
        return service.getDoanhThuTheoThangTrongNam();
    }

    @GetMapping("/don-hang-gan-day")
    public ResponseEntity<List<Map<String, Object>>> getDonHangGanDay(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> donHangs = service.layDonHangGanDay(limit);
        return ResponseEntity.ok(donHangs);
    }
    // top san pham ban chay
    @GetMapping("/top-san-pham")
    public ResponseEntity<List<Object[]>> getTopSanPham() {
        return ResponseEntity.ok(service.getTop3SanPhamBanChay());
    }


}


