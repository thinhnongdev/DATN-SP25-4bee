package com.example.server.service.HoaDon.impl;

import com.example.server.constant.HoaDonConstant;
import com.example.server.dto.HoaDon.request.LichSuHoaDonRequest;
import com.example.server.dto.HoaDon.response.LichSuHoaDonResponse;
import com.example.server.dto.ThongBao.ThongBaoDTO;
import com.example.server.entity.HoaDon;
import com.example.server.entity.LichSuHoaDon;
import com.example.server.entity.NhanVien;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.impl.LichSuHoaDonMapper;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
@Slf4j
public class LichSuHoaDonService {
    private final LichSuHoaDonRepository repository;
    private final LichSuHoaDonMapper mapper;
    private final HoaDonRepository hoaDonRepository;
    @Autowired
    private NhanVienRepository nhanVienRepository;
    @Autowired
    private CurrentUserServiceImpl currentUserService;

    public LichSuHoaDonService(LichSuHoaDonRepository repository, LichSuHoaDonMapper mapper, HoaDonRepository hoaDonRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.hoaDonRepository = hoaDonRepository;
    }

    public List<LichSuHoaDonResponse> getByHoaDonId(String hoaDonId) {
        return repository.findByHoaDonId(hoaDonId)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public void saveLichSuHoaDon(LichSuHoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(request.getHoaDonId())
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại với ID: " + request.getHoaDonId()));

        // Lấy nhân viên hiện tại từ CurrentUserServiceImpl
        NhanVien nhanVien = currentUserService.getCurrentNhanVien();

        LichSuHoaDon entity = new LichSuHoaDon();
        entity.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        entity.setHoaDon(hoaDon);
        entity.setTrangThai(request.getTrangThai());
        entity.setNgayTao(LocalDateTime.now());
        entity.setNhanVien(nhanVien); // Gán trực tiếp nhân viên lấy từ CurrentUserServiceImpl
        entity.setHanhDong("Cập nhật trạng thái hóa đơn");
        entity.setMoTa(request.getGhiChu() != null ? request.getGhiChu() : "Không có mô tả");

        // Lưu vào database
        repository.save(entity);
    }

    // Thêm phương thức này để lấy thông báo
    // Sửa dòng gây lỗi trong phương thức getNotificationsForCurrentUser()
    public List<ThongBaoDTO> getNotificationsForCurrentUser() {
        NhanVien nhanVien = currentUserService.getCurrentNhanVien();

        // Sửa dòng này để sử dụng PageRequest.of thay vì truyền trực tiếp số nguyên
        List<LichSuHoaDon> notifications = repository.findNotificationsForUser(
                nhanVien.getId(),
                org.springframework.data.domain.PageRequest.of(0, 10)
        );

        return notifications.stream()
                .map(this::convertToThongBaoDTO)
                .collect(Collectors.toList());
    }

    // Cập nhật phương thức convertToThongBaoDTO
    // Trong phương thức convertToThongBaoDTO, cập nhật phần tạo nội dung thông báo:
    private ThongBaoDTO convertToThongBaoDTO(LichSuHoaDon lichSu) {
        ThongBaoDTO dto = new ThongBaoDTO();
        dto.setId(lichSu.getId());

        // Chuẩn bị thông tin bổ sung
        HoaDon hoaDon = lichSu.getHoaDon();
        String maHoaDon = hoaDon.getMaHoaDon();
        String tongTienStr = "";
        if (hoaDon.getTongTien() != null) {
            tongTienStr = String.format("%,.0f đ", hoaDon.getTongTien());
        }

        // Kiểm tra xem có phải là đơn hàng từ khách hàng hay không
        if (lichSu.getKhachHang() != null && lichSu.getMoTa() != null && lichSu.getMoTa().contains("Khách hàng tạo đơn hàng")) {
            dto.setTieuDe("Đơn hàng mới từ khách hàng");
            dto.setLoaiThongBao("HOA_DON_MOI_TU_KHACH");

            // Bổ sung thông tin chi tiết hơn
            if (lichSu.getKhachHang() != null) {
                dto.setNoiDung(String.format("Khách hàng %s tạo đơn hàng #%s - %s",
                        lichSu.getKhachHang().getTenKhachHang(), maHoaDon, tongTienStr));
            } else {
                dto.setNoiDung(lichSu.getMoTa());
            }
        } else {
            // Tiêu đề thông báo
            String tieuDe = getNotificationTitle(lichSu);
            dto.setTieuDe(tieuDe);
            dto.setLoaiThongBao(getNotificationType(lichSu));

            // Nội dung thông báo nâng cao
            if (lichSu.getTrangThai() == HoaDonConstant.TRANG_THAI_DA_XAC_NHAN) {
                // Đơn hàng đã được xác nhận - bổ sung thông tin chi tiết
                String nhanVienTen = lichSu.getNhanVien() != null ? lichSu.getNhanVien().getTenNhanVien() : "Nhân viên";
                dto.setNoiDung(String.format("Đơn hàng #%s đã được %s xác nhận - %s",
                        maHoaDon, nhanVienTen, tongTienStr));
            } else if (lichSu.getTrangThai() == HoaDonConstant.TRANG_THAI_HOAN_THANH) {
                // Đơn hàng hoàn thành
                dto.setNoiDung(String.format("Đơn hàng #%s đã hoàn thành - %s",
                        maHoaDon, tongTienStr));
            } else if (lichSu.getTrangThai() == HoaDonConstant.TRANG_THAI_DA_HUY) {
                // Đơn hàng đã hủy - thêm lý do nếu có
                String lyDo = lichSu.getMoTa() != null && !lichSu.getMoTa().equals("Không có mô tả")
                        ? lichSu.getMoTa()
                        : "Không có lý do cụ thể";
                dto.setNoiDung(String.format("Đơn hàng #%s đã bị hủy - Lý do: %s", maHoaDon, lyDo));
            } else {
                // Các trạng thái khác giữ nguyên nội dung gốc
                dto.setNoiDung(lichSu.getMoTa());
            }
        }

        dto.setMaHoaDon(maHoaDon);
        dto.setEntityId(hoaDon.getId());
        dto.setDaDoc(lichSu.getNgaySua() != null);
        dto.setNgayTao(lichSu.getNgayTao());
        dto.setNgayDoc(lichSu.getNgaySua());
        return dto;
    }

    private String getNotificationTitle(LichSuHoaDon lichSu) {
        if (lichSu.getTrangThai() != null) {
            switch (lichSu.getTrangThai()) {
                case HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN:
                    return "Đơn hàng chờ xác nhận mới";
                case HoaDonConstant.TRANG_THAI_DA_XAC_NHAN:
                    return "Đơn hàng đã được xác nhận";
                case HoaDonConstant.TRANG_THAI_HOAN_THANH:
                    return "Đơn hàng đã hoàn thành";
                case HoaDonConstant.TRANG_THAI_DA_HUY:
                    return "Đơn hàng đã bị hủy";
                default:
                    return "Thông báo đơn hàng";
            }
        }
        return lichSu.getHanhDong();
    }

    private String getNotificationType(LichSuHoaDon lichSu) {
        if (lichSu.getTrangThai() != null) {
            switch (lichSu.getTrangThai()) {
                case HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN:
                    return "HOA_DON_MOI";
                case HoaDonConstant.TRANG_THAI_DA_XAC_NHAN:
                    return "HOA_DON_XAC_NHAN";
                case HoaDonConstant.TRANG_THAI_HOAN_THANH:
                    return "HOA_DON_HOAN_THANH";
                case HoaDonConstant.TRANG_THAI_DA_HUY:
                    return "HOA_DON_HUY";
                default:
                    return "TRANG_THAI_" + lichSu.getTrangThai();
            }
        }
        return "KHAC";
    }

    // Đánh dấu đã đọc một thông báo (sử dụng ngaySua thay vì daDoc)
    @Transactional
    public void markAsRead(String id) {
        LichSuHoaDon lichSu = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo với id: " + id));

        lichSu.setNgaySua(LocalDateTime.now()); // Sử dụng ngaySua để đánh dấu đã đọc
        repository.save(lichSu);
        log.info("Đã đánh dấu đã đọc cho thông báo: {}", id);
    }

    // Đánh dấu đã đọc tất cả thông báo
    @Transactional
    public void markAllAsRead() {
        NhanVien nhanVien = currentUserService.getCurrentNhanVien();
        List<LichSuHoaDon> unreadNotifications = repository.findUnreadNotificationsForUser(nhanVien.getId());

        LocalDateTime now = LocalDateTime.now();
        for (LichSuHoaDon lichSu : unreadNotifications) {
            lichSu.setNgaySua(now); // Sử dụng ngaySua để đánh dấu đã đọc
        }

        if (!unreadNotifications.isEmpty()) {
            repository.saveAll(unreadNotifications);
            log.info("Đã đánh dấu đã đọc cho {} thông báo", unreadNotifications.size());
        }
    }

    // Lấy số lượng thông báo chưa đọc
    public int getUnreadNotificationsCount() {
        NhanVien nhanVien = currentUserService.getCurrentNhanVien();
        return repository.countUnreadNotificationsForUser(nhanVien.getId());
    }
}