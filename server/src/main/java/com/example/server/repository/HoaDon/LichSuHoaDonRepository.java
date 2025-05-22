package com.example.server.repository.HoaDon;

import com.example.server.constant.HoaDonConstant;
import com.example.server.entity.LichSuHoaDon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    // Cập nhật truy vấn để hỗ trợ phân trang
    @Query(value = "SELECT l FROM LichSuHoaDon l " +
            "WHERE ((l.nhanVien.id = :nhanVienId) OR " +
            "(l.hanhDong = 'Cập nhật trạng thái hóa đơn' AND l.trangThai = " + HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN + ") OR " +
            "(l.moTa LIKE '%Khách hàng tạo đơn hàng%')) " +
            "AND l.trangThai IN (1, 2, 5, 6) " +
            "ORDER BY l.ngayTao DESC")
    Page<LichSuHoaDon> findNotificationsForUserPaged(String nhanVienId, Pageable pageable);

    // Truy vấn với bộ lọc đầy đủ
    // Thay đổi truy vấn đang có vấn đề
    @Query(value = "SELECT l FROM LichSuHoaDon l " +
            "WHERE ((l.nhanVien.id = :nhanVienId) OR " +
            "(l.hanhDong = 'Cập nhật trạng thái hóa đơn' AND l.trangThai = " + HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN + ") OR " +
            "(l.moTa LIKE '%Khách hàng tạo đơn hàng%')) " +
            "AND (:search IS NULL OR l.moTa LIKE %:search% OR l.hoaDon.maHoaDon LIKE %:search%) " +
            "AND (:read IS NULL OR (:read = true AND l.ngaySua IS NOT NULL) OR (:read = false AND l.ngaySua IS NULL)) " +
            "AND (:types IS NULL OR " +
            "   (1 IN :types AND l.trangThai = " + HoaDonConstant.TRANG_THAI_CHO_XAC_NHAN + ") OR " +
            "   (2 IN :types AND l.trangThai = " + HoaDonConstant.TRANG_THAI_DA_XAC_NHAN + ") OR " +
            "   (5 IN :types AND l.trangThai = " + HoaDonConstant.TRANG_THAI_HOAN_THANH + ") OR " +
            "   (6 IN :types AND l.trangThai = " + HoaDonConstant.TRANG_THAI_DA_HUY + ") OR " +
            "   (10 IN :types AND l.moTa LIKE '%Khách hàng tạo đơn hàng%')" +
            ") " +
            "AND (:fromDate IS NULL OR l.ngayTao >= :fromDate) " +
            "AND (:toDate IS NULL OR l.ngayTao <= :toDate) " +
            "ORDER BY l.ngayTao DESC")
    Page<LichSuHoaDon> findNotificationsWithFilters(
            @Param("nhanVienId") String nhanVienId,
            @Param("search") String search,
            @Param("types") List<Integer> types,
            @Param("read") Boolean read,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);
}