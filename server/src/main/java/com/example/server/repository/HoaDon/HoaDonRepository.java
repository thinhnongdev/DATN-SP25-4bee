package com.example.server.repository.HoaDon;

import com.example.server.dto.Client.response.HoaDonChiTietClientResponse;
import com.example.server.dto.Client.response.HoaDonClientResponse;
import com.example.server.dto.HoaDon.response.HoaDonResponse;
import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.entity.HoaDon;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String>,
        JpaSpecificationExecutor<HoaDon> {

    @Query("SELECT h FROM HoaDon h WHERE h.trangThai = :trangThai")
    List<HoaDon> findByTrangThai(@Param("trangThai") Integer trangThai);

    @Query("SELECT new com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO(" +
            "h.trangThai, COUNT(h), SUM(h.tongTien), " +
            "CASE " +
            "  WHEN h.trangThai = 1 THEN 'Chờ xác nhận' " +
            "  WHEN h.trangThai = 2 THEN 'Đã xác nhận' " +
            "  WHEN h.trangThai = 3 THEN 'Đang giao' " +
            "  WHEN h.trangThai = 4 THEN 'Đã giao' " +
            "  WHEN h.trangThai = 5 THEN 'Đã hủy' " +
            "  ELSE 'Không xác định' " +
            "END) " +
            "FROM HoaDon h " +
            "WHERE h.ngayTao BETWEEN :fromDate AND :toDate " +
            "GROUP BY h.trangThai")
    List<HoaDonStatisticsDTO> getStatistics(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    @Query(value = "SELECT * FROM hoa_don WHERE loai_hoa_don IN (2, 3) AND trang_thai = 1", nativeQuery = true)
    List<HoaDon> getHoaDonTheoLoai();


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM HoaDon h WHERE h.id = :hoaDonId")
    HoaDon findHoaDonForUpdate(@Param("hoaDonId") String hoaDonId);

    // Doanh Thu ngày
    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE DATE(ngay_tao) = CURDATE() AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuNgayHienTai();

    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE DATE(ngay_tao) = CURDATE() - INTERVAL 1 DAY AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuNgayTruoc();


    // Doanh thư Tuần
    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE YEARWEEK(ngay_tao, 1) = YEARWEEK(CURDATE(), 1) AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuTuanHienTai();

    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE YEARWEEK(ngay_tao, 1) = YEARWEEK(CURDATE(), 1) - 1 AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuTuanTruoc();


    // Doanh Thu Tháng
    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE MONTH(ngay_tao) = MONTH(CURDATE()) AND YEAR(ngay_tao) = YEAR(CURDATE()) AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuThangHienTai();

    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE MONTH(ngay_tao) = MONTH(CURDATE() - INTERVAL 1 MONTH) " +
            "AND YEAR(ngay_tao) = YEAR(CURDATE()) AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuThangTruoc();

    // Doanh thu năm
    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE YEAR(ngay_tao) = YEAR(CURDATE()) AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuNamHienTai();

    @Query(value = "SELECT IFNULL(SUM(tong_tien), 0) FROM hoa_don " +
            "WHERE YEAR(ngay_tao) = YEAR(CURDATE()) - 1 AND trang_thai = 5",
            nativeQuery = true)
    BigDecimal getDoanhThuNamTruoc();

    //Trạng thái

    @Query("SELECT h.trangThai, COUNT(h) FROM HoaDon h GROUP BY h.trangThai")
    List<Object[]> countOrdersByStatus();


    @Query(value = "SELECT DATE(hd.ngay_tao) AS date, SUM(COALESCE(hdct.so_luong, 0)) AS soluong " +
            "FROM hoa_don hd " +
            "JOIN hoa_don_chi_tiet hdct ON hd.id = hdct.id_hoa_don " +
            "WHERE hd.ngay_tao BETWEEN :startDate AND :endDate AND hd.trang_thai = 5 " +
            "GROUP BY DATE(hd.ngay_tao) " +
            "ORDER BY date",
            nativeQuery = true)
    List<Object[]> getSoLuongSanPhamBanTheoNgay(@Param("startDate") Date startDate, @Param("endDate") Date endDate);


    @Query(value = "SELECT date, SUM(soluong) AS soluong FROM ( " +
            "    SELECT DATE(hd.ngay_tao) AS date, COALESCE(SUM(hdct.so_luong), 0) AS soluong " +
            "    FROM hoa_don hd " +
            "    LEFT JOIN hoa_don_chi_tiet hdct ON hd.id = hdct.id_hoa_don " +
            "    WHERE DATE(hd.ngay_tao) = CURDATE() AND hd.trang_thai = 5 " +
            "    GROUP BY DATE(hd.ngay_tao) " +
            "    UNION " +
            "    SELECT CURDATE() AS date, 0 AS soluong " +
            "    WHERE NOT EXISTS (SELECT 1 FROM hoa_don WHERE DATE(ngay_tao) = CURDATE() AND trang_thai = 5) " +
            ") AS combined " +
            "GROUP BY date", nativeQuery = true)
    Object[] getSoLuongSanPhamHomNay();



    @Query(value = "SELECT DATE(hd.ngay_tao) AS date, COALESCE(SUM(hdct.so_luong), 0) AS quantity " +
            "FROM hoa_don hd " +
            "LEFT JOIN hoa_don_chi_tiet hdct ON hd.id = hdct.id_hoa_don " +
            "WHERE MONTH(hd.ngay_tao) = MONTH(CURDATE()) AND YEAR(hd.ngay_tao) = YEAR(CURDATE()) AND hd.trang_thai = 5 " +
            "GROUP BY DATE(hd.ngay_tao) " +
            "ORDER BY date", nativeQuery = true)
    List<Object[]> getSoLuongSanPhamTheoThang();


    @Query(value = "SELECT DATE_FORMAT(hd.ngay_tao, '%Y-%m') AS month, " +
            "COALESCE(SUM(hdct.so_luong), 0) AS quantity " +
            "FROM hoa_don hd " +
            "LEFT JOIN hoa_don_chi_tiet hdct ON hd.id = hdct.id_hoa_don " +
            "WHERE YEAR(hd.ngay_tao) = YEAR(CURDATE()) AND hd.trang_thai = 5 " +
            "GROUP BY DATE_FORMAT(hd.ngay_tao, '%Y-%m') " +
            "ORDER BY month",
            nativeQuery = true)
    List<Object[]> getThongKeSoLuongSanPhamTheoNam();

    // tiền
    @Query(value = "SELECT DATE(ngay_tao) AS date, COALESCE(SUM(tong_tien), 0) AS revenue " +
            "FROM hoa_don " +
            "WHERE ngay_tao BETWEEN :startDate AND :endDate AND trang_thai = 5 " +
            "GROUP BY DATE(ngay_tao) " +
            "ORDER BY date",
            nativeQuery = true)
    List<Object[]> getDoanhThuTheoKhoangNgay(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query(value = "SELECT DATE(ngay_tao) AS date, COALESCE(SUM(tong_tien), 0) AS revenue " +
            "FROM hoa_don " +
            "WHERE DATE(ngay_tao) = CURDATE() AND trang_thai = 5 " +
            "GROUP BY DATE(ngay_tao)",
            nativeQuery = true)
    Object[] getDoanhThuHomNay();


    @Query(value = "SELECT DATE(ngay_tao) AS date, COALESCE(SUM(tong_tien), 0) AS revenue " +
            "FROM hoa_don " +
            "WHERE MONTH(ngay_tao) = MONTH(CURDATE()) AND YEAR(ngay_tao) = YEAR(CURDATE()) AND trang_thai = 5 " +
            "GROUP BY DATE(ngay_tao) " +
            "ORDER BY date",
            nativeQuery = true)
    List<Object[]> getDoanhThuTheoNgayTrongThang();


    @Query(value = "SELECT DATE_FORMAT(ngay_tao, '%Y-%m') AS month, COALESCE(SUM(tong_tien), 0) AS revenue " +
            "FROM hoa_don " +
            "WHERE YEAR(ngay_tao) = YEAR(CURDATE()) AND trang_thai = 5 " +
            "GROUP BY DATE_FORMAT(ngay_tao, '%Y-%m') " +
            "ORDER BY month",
            nativeQuery = true)
    List<Object[]> getDoanhThuTheoThangTrongNam();

    @Query(value = """
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ngay_tao DESC) AS STT, 
        ma_hoa_don as MaHoaDon,
        trang_thai AS trangthai, 
        loai_hoa_don AS loaidon, 
        ngay_tao AS ngaytao, 
        ten_nguoi_nhan AS khachHang, 
        tong_tien AS doanhSo 
    FROM hoa_don
    ORDER BY ngay_tao DESC
    LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> getDonHangGanDay(@Param("limit") int limit);



    @Query(value = """
    SELECT sp.ten_san_pham AS product, 
           SUM(hdct.so_luong) AS sold 
    FROM hoa_don_chi_tiet hdct
    JOIN san_pham_chi_tiet spct ON hdct.id_san_pham_chi_tiet = spct.id
    JOIN san_pham sp ON spct.id_san_pham = sp.id
    GROUP BY sp.id, sp.ten_san_pham
    ORDER BY sold DESC
    LIMIT 3
    """, nativeQuery = true)
    List<Object[]> getTop3SanPhamBanChay();


    @Query("select h from HoaDon h where h.trangThai=10 and h.khachHang.email=:email")
    Optional<HoaDon> findHoaDonPending(String email);
    @Query("SELECT h FROM HoaDon h WHERE h.trangThai =10 and h.maHoaDon=:maHoaDon")
    Optional<HoaDon> findByMaHoaDon(@Param("maHoaDon") String maHoaDon);
    @Query("select new com.example.server.dto.Client.response.HoaDonClientResponse(" +
            "h.id,h.maHoaDon,h.phieuGiamGia.id,h.khachHang.id," +
            "h.loaiHoaDon,h.tenNguoiNhan,h.soDienThoai,h.emailNguoiNhan,h.diaChi," +
            "h.trangThaiGiaoHang,h.thoiGianGiaoHang,h.thoiGianNhanHang,h.tongTien,h.phiVanChuyen" +
            ",h.ghiChu,h.trangThai,h.ngayTao,h.ngaySua,h.nguoiTao,h.nguoiSua)" +
            " from HoaDon h where h.loaiHoaDon=1 and  h.trangThai <> 10  and h.khachHang.email=:email") //bỏ hóa đơn có trang thái là pendding
    List<HoaDonClientResponse> findHoaDonClient(String email);
    @Query("select new com.example.server.dto.Client.response.HoaDonClientResponse(" +
            "h.id,h.maHoaDon,h.phieuGiamGia.id,h.khachHang.id," +
            "h.loaiHoaDon,h.tenNguoiNhan,h.soDienThoai,h.emailNguoiNhan,h.diaChi," +
            "h.trangThaiGiaoHang,h.thoiGianGiaoHang,h.thoiGianNhanHang,h.tongTien,h.phiVanChuyen" +
            ",h.ghiChu,h.trangThai,h.ngayTao,h.ngaySua,h.nguoiTao,h.nguoiSua)" +
            " from HoaDon h where h.loaiHoaDon=1 and  h.trangThai <> 10  and h.id=:idHoaDon") //bỏ hóa đơn có trang thái là pendding
    Optional<HoaDonClientResponse> findHoaDonClientByIdHoaDon(String idHoaDon);
    @Query("SELECT new com.example.server.dto.Client.response.HoaDonChiTietClientResponse( " +
            " h.hoaDon.id, h.sanPhamChiTiet.id,h.id, h.soLuong, h.trangThai, h.giaTaiThoiDiemThem, h.ngayThemVaoGio) " +
            "FROM HoaDonChiTiet h WHERE h.hoaDon.id = :hoaDonId AND h.trangThai = 1")
    List<HoaDonChiTietClientResponse> findByHoaDonId(@Param("hoaDonId") String hoaDonId);
}
