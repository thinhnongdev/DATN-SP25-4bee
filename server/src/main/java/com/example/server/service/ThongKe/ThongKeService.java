package com.example.server.service.ThongKe;

import com.example.server.dto.HoaDon.HoaDonDTO.HoaDonDTO;
import com.example.server.dto.HoaDon.HoaDonDTO.ThongKeSoLuongDTO;
import com.example.server.repository.HoaDon.HoaDonRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class ThongKeService {
    private final HoaDonRepository hoaDonRepository;

    public ThongKeService(HoaDonRepository hoaDonRepository) {
        this.hoaDonRepository = hoaDonRepository;
    }

    // Hàm xử lý giá trị null
    private BigDecimal getSafeValue(BigDecimal value) {
        return Optional.ofNullable(value).orElse(BigDecimal.ZERO);
    }

    // Hàm tính phần trăm tăng trưởng
    private BigDecimal calculatePercentageGrowth(BigDecimal current, BigDecimal previous) {
        // Nếu doanh thu trước đó là 0 và doanh thu hiện tại không phải 0
        if (previous.signum() == 0) {
            if (current.signum() > 0) {
                return BigDecimal.valueOf(100); // Doanh thu hiện tại khác 0, coi như tăng 100%
            } else {
                return BigDecimal.ZERO; // Cả hai đều 0, tăng trưởng 0%
            }
        }

        // Tính phần trăm tăng trưởng với độ chính xác cao
        BigDecimal growth = current.subtract(previous)
                .divide(previous, 10, RoundingMode.HALF_UP) // Giữ độ chính xác cao với 10 chữ số thập phân
                .multiply(BigDecimal.valueOf(100));

        // Làm tròn kết quả thành 2 chữ số thập phân sau cùng
        return growth.setScale(4, RoundingMode.HALF_UP);  // Làm tròn kết quả đến 4 chữ số thập phân (hoặc bạn có thể điều chỉnh cho phù hợp)
    }


    // Hàm chung lấy thống kê doanh thu
    private Map<String, Object> getThongKeDoanhThu(Supplier<BigDecimal> currentSupplier, Supplier<BigDecimal> previousSupplier) {
        BigDecimal currentRevenue = getSafeValue(currentSupplier.get());
        BigDecimal previousRevenue = getSafeValue(previousSupplier.get());
        BigDecimal growthPercentage = calculatePercentageGrowth(currentRevenue, previousRevenue);

        Map<String, Object> response = new HashMap<>();
        response.put("revenue", currentRevenue);
        response.put("growth", growthPercentage);
        return response;
    }

    // Doanh thu ngày
    public Map<String, Object> getThongKeDoanhThuNgay() {
        return getThongKeDoanhThu(hoaDonRepository::getDoanhThuNgayHienTai, hoaDonRepository::getDoanhThuNgayTruoc);
    }

    // Doanh thu tuần
    public Map<String, Object> getThongKeDoanhThuTuan() {
        return getThongKeDoanhThu(hoaDonRepository::getDoanhThuTuanHienTai, hoaDonRepository::getDoanhThuTuanTruoc);
    }

    // Doanh thu tháng
    public Map<String, Object> getThongKeDoanhThuThang() {
        return getThongKeDoanhThu(hoaDonRepository::getDoanhThuThangHienTai, hoaDonRepository::getDoanhThuThangTruoc);
    }

    // Doanh thu năm
    public Map<String, Object> getThongKeDoanhThuNam() {
        return getThongKeDoanhThu(hoaDonRepository::getDoanhThuNamHienTai, hoaDonRepository::getDoanhThuNamTruoc);
    }


    private static final Map<Integer, String> TRANG_THAI_MAP = Map.of(
            1, "Chờ xác nhận",
            2, "Đã xác nhận",
            3, "Chờ giao hàng",
            4, "Đang giao",
            5, "Hoàn thành",
            6, "Đã huỷ"
    );

    public List<HoaDonDTO> getOrderStatistics() {
        List<Object[]> results = hoaDonRepository.countOrdersByStatus();
        Map<Integer, Long> countMap = results.stream()
                .collect(Collectors.toMap(r -> (Integer) r[0], r -> (Long) r[1]));

        return TRANG_THAI_MAP.entrySet().stream()
                .map(entry -> new HoaDonDTO(entry.getKey(), entry.getValue(), Math.toIntExact(countMap.getOrDefault(entry.getKey(), 0L))))
                .collect(Collectors.toList());
    }





    public List<ThongKeSoLuongDTO> getSoLuongSanPhamBanTheoNgay(Date startDate, Date endDate) {
        List<Object[]> results = hoaDonRepository.getSoLuongSanPhamBanTheoNgay(startDate, endDate);
        return results.stream().map(obj -> new ThongKeSoLuongDTO(
                (Date) obj[0],
                ((Number) obj[1]).intValue()
        )).collect(Collectors.toList());
    }

    public Map<String, Object> getSoLuongSanPhamHomNay() {
        Object[] result = hoaDonRepository.getSoLuongSanPhamHomNay();
        Map<String, Object> response = new HashMap<>();

        // Lấy ngày hiện tại
        LocalDate today = LocalDate.now();

        if (result != null && result.length == 2) {
            response.put("date", result[0]); // Ngày từ DB
            response.put("soLuong", result[1]); // Số lượng sản phẩm
        } else {
            response.put("date", today); // Gán ngày hôm nay nếu không có dữ liệu
            response.put("soLuong", 0);
        }
        return response;
    }


    public Map<String, Object> getSoLuongSanPhamTheoThang() {
        List<Object[]> results = hoaDonRepository.getSoLuongSanPhamTheoThang();
        List<Map<String, Object>> data = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("date", row[0]);  // Ngày
            item.put("soLuong", row[1]); // Số lượng sản phẩm
            data.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        return response;
    }

    public List<Map<String, Object>> getThongKeSoLuongSanPhamTheoNam() {
        List<Object[]> results = hoaDonRepository.getThongKeSoLuongSanPhamTheoNam();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> data = new HashMap<>();
            data.put("date", row[0]);  // YYYY-MM
            data.put("soLuong", row[1]); // Số lượng sản phẩm bán
            response.add(data);
        }
        return response;
    }


    //doanh thu

    public List<Map<String, Object>> getDoanhThuTheoKhoangNgay(Date startDate, Date endDate) {
        List<Object[]> results = hoaDonRepository.getDoanhThuTheoKhoangNgay(startDate, endDate);
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> data = new HashMap<>();
            data.put("date", row[0]);    // Ngày
            data.put("revenue", row[1]); // Tổng doanh thu
            response.add(data);
        }
        return response;
    }


    public Map<String, Object> getDoanhThuHomNay() {
        Object[] result = hoaDonRepository.getDoanhThuHomNay();
        Map<String, Object> response = new HashMap<>();

        if (result != null && result.length == 2) {
            response.put("date", result[0]);
            response.put("revenue", result[1]);
        } else {
            response.put("date", new Date()); // Ngày hiện tại
            response.put("revenue", 0);
        }

        return response;
    }


    public List<Map<String, Object>> getDoanhThuTheoNgayTrongThang() {
        List<Object[]> results = hoaDonRepository.getDoanhThuTheoNgayTrongThang();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] result : results) {
            Map<String, Object> data = new HashMap<>();
            data.put("date", result[0]);  // Ngày
            data.put("revenue", result[1]); // Doanh thu
            response.add(data);
        }

        return response;
    }


    public List<Map<String, Object>> getDoanhThuTheoThangTrongNam() {
        List<Object[]> results = hoaDonRepository.getDoanhThuTheoThangTrongNam();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] obj : results) {
            Map<String, Object> data = new HashMap<>();
            data.put("date", obj[0]);  // YYYY-MM
            data.put("revenue", obj[1]); // Tổng doanh thu
            response.add(data);
        }

        return response;
    }
    //đon hang gan đây
    public List<Map<String, Object>> layDonHangGanDay(int limit) {
        List<Object[]> results = hoaDonRepository.getDonHangGanDay(limit);
        List<Map<String, Object>> donHangs = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("stt", row[0]);
            map.put("mahoadon", row[1]);
            map.put("trangthai", row[2]);
            map.put("loaidon", row[3]);
            map.put("ngaytao", row[4]);
            map.put("khachHang", row[5]);
            map.put("doanhSo", row[6]);
            donHangs.add(map);
        }

        return donHangs;
    }


    public List<Object[]> getTop3SanPhamBanChay() {
        return hoaDonRepository.getTop3SanPhamBanChay();
    }


}

