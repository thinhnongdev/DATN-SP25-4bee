package com.example.server.repository.HoaDon;

import com.example.server.constant.HoaDonConstant;
import com.example.server.entity.LichSuHoaDon;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuHoaDonRepository extends JpaRepository<LichSuHoaDon, String> {
    List<LichSuHoaDon> findByHoaDonId(String hoaDonId);

    // Cập nhật truy vấn để lấy cả đơn hàng từ khách hàng
    @Query(value = "SELECT l FROM LichSuHoaDon l " +
            "WHERE ((l.nhanVien.id = :nhanVienId) OR " +
            "(l.hanhDong = 'Cập nhật trạng thái hóa đơn' AND l.trangThai = " + HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN + ") OR " +
            "(l.moTa LIKE '%Khách hàng tạo đơn hàng%')) " +
            "AND l.trangThai IN (1, 2, 5, 6) " +
            "ORDER BY l.ngayTao DESC")
    List<LichSuHoaDon> findNotificationsForUser(String nhanVienId, Pageable pageable);


    // Cập nhật truy vấn thông báo chưa đọc
    @Query(value = "SELECT l FROM LichSuHoaDon l " +
            "WHERE ((l.nhanVien.id = :nhanVienId) OR " +
            "(l.hanhDong = 'Cập nhật trạng thái hóa đơn' AND l.trangThai = " + HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN + ") OR " +
            "(l.moTa LIKE '%Khách hàng tạo đơn hàng%')) " +
            "AND l.trangThai IN (1, 2, 5, 6) " +
            "AND l.ngaySua IS NULL " +
            "ORDER BY l.ngayTao DESC")
    List<LichSuHoaDon> findUnreadNotificationsForUser(String nhanVienId);

    // Cập nhật đếm số thông báo chưa đọc
    @Query(value = "SELECT COUNT(l) FROM LichSuHoaDon l " +
            "WHERE ((l.nhanVien.id = :nhanVienId) OR " +
            "(l.hanhDong = 'Cập nhật trạng thái hóa đơn' AND l.trangThai = " + HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN + ") OR " +
            "(l.moTa LIKE '%Khách hàng tạo đơn hàng%')) " +
            "AND l.trangThai IN (1, 2, 5, 6) " +
            "AND l.ngaySua IS NULL")
    int countUnreadNotificationsForUser(String nhanVienId);
}