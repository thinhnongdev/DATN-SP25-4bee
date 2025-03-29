package com.example.server.repository.PhieuGiamGia;

import com.example.server.entity.PhieuGiamGia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository

public interface PhieuGiamGiaRepository extends JpaRepository<PhieuGiamGia, String>,
        JpaSpecificationExecutor<PhieuGiamGia> {
    @Query("SELECT p FROM PhieuGiamGia p WHERE p.kieuGiamGia=1 and p.trangThai=1 ORDER BY p.ngayTao DESC")
    List<PhieuGiamGia> findAllCongKhai();
    Optional<PhieuGiamGia> findByMaPhieuGiamGia(String maPhieuGiamGia);

    @Query("SELECT pgg FROM PhieuGiamGia pgg WHERE " +
            "pgg.trangThai = 1 AND " + // Đang hoạt động
            "pgg.soLuong > 0 AND " +  // Còn số lượng
            "pgg.ngayBatDau <= :currentTime AND " + // Trong thời gian hiệu lực
            "pgg.ngayKetThuc >= :currentTime AND " +
            "pgg.giaTriToiThieu <= :giaTriDonHang " + // Đủ điều kiện áp dụng
            "ORDER BY " +
            "CASE pgg.loaiPhieuGiamGia " + // Sắp xếp theo loại và giá trị giảm
            "   WHEN 1 THEN pgg.giaTriGiam * :giaTriDonHang / 100 " +
            "   ELSE pgg.giaTriGiam " +
            "END DESC")
    List<PhieuGiamGia> findAvailableVouchersForOrder(
            @Param("currentTime") LocalDateTime currentTime,
            @Param("giaTriDonHang") BigDecimal giaTriDonHang
    );

    @Query("SELECT pgg FROM PhieuGiamGia pgg WHERE " +
            "pgg.trangThai = 1 AND " +
            "pgg.soLuong > 0 AND " +
            "pgg.ngayBatDau <= :currentTime AND " +
            "pgg.ngayKetThuc >= :currentTime")
    List<PhieuGiamGia> findAllActiveVouchers(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT pgg FROM PhieuGiamGia pgg WHERE " +
            "(:keyword IS NULL OR " +
            "LOWER(pgg.maPhieuGiamGia) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(pgg.tenPhieuGiamGia) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:trangThai IS NULL OR pgg.trangThai = :trangThai) " +
            "AND (:loaiPhieuGiamGia IS NULL OR pgg.loaiPhieuGiamGia = :loaiPhieuGiamGia)")
    Page<PhieuGiamGia> search(@Param("keyword") String keyword,
                              @Param("trangThai") Integer trangThai,
                              @Param("loaiPhieuGiamGia") Integer loaiPhieuGiamGia,
                              Pageable pageable);

    @Query("SELECT pgg FROM PhieuGiamGia pgg WHERE " +
            "pgg.trangThai = 1 AND " +
            "pgg.ngayKetThuc < :currentTime")
    List<PhieuGiamGia> findExpiredVouchers(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(pgg) FROM PhieuGiamGia pgg WHERE " +
            "pgg.trangThai = 1 AND " +
            "pgg.soLuong > 0 AND " +
            "pgg.ngayBatDau <= :currentTime AND " +
            "pgg.ngayKetThuc >= :currentTime")
    long countActiveVouchers(@Param("currentTime") LocalDateTime currentTime);

    List<PhieuGiamGia> findByTrangThai(int trangThai);
    //    Nam
    List<PhieuGiamGia> findAllByNgayKetThucBeforeAndTrangThai(LocalDateTime dateTime, int trangThai);

    Optional<PhieuGiamGia> findByMaPhieuGiamGiaAndTrangThai(String maPhieuGiamGia, Integer trangThai);

    @Query("SELECT p FROM PhieuGiamGia p ORDER BY p.ngayTao DESC")
    List<PhieuGiamGia> findAllSortedByNgayTao();

    boolean existsByMaPhieuGiamGia(String maPhieuGiamGia);
}

//@Repository
//public interface PhieuGiamGiaRepository extends JpaRepository<PhieuGiamGia, String>,
//        JpaSpecificationExecutor<PhieuGiamGia> {
//
//    Optional<PhieuGiamGia> findByMaPhieuGiamGia(String maPhieuGiamGia);
//
//    @Query("SELECT pgg FROM PhieuGiamGia pgg WHERE " +
//            "pgg.trangThai = :trangThai AND " +
//            "pgg.soLuong > 0 AND " +
//            "pgg.ngayBatDau <= :currentTime AND " +
//            "pgg.ngayKetThuc >= :currentTime AND " +
//            "pgg.giaTriToiThieu <= :giaTriDonHang")
//    List<PhieuGiamGia> findAvailableVouchers(@Param("trangThai") Integer trangThai,
//                                             @Param("currentTime") LocalDateTime currentTime,
//                                             @Param("giaTriDonHang") BigDecimal giaTriDonHang);
//
//    @Query("SELECT pgg FROM PhieuGiamGia pgg WHERE " +
//            "(:keyword IS NULL OR " +
//            "LOWER(pgg.maPhieuGiamGia) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
//            "LOWER(pgg.tenPhieuGiamGia) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
//            "AND (:trangThai IS NULL OR pgg.trangThai = :trangThai) " +
//            "AND (:loaiPhieuGiamGia IS NULL OR pgg.loaiPhieuGiamGia = :loaiPhieuGiamGia)")
//    Page<PhieuGiamGia> search(@Param("keyword") String keyword,
//                              @Param("trangThai") Integer trangThai,
//                              @Param("loaiPhieuGiamGia") Integer loaiPhieuGiamGia,
//                              Pageable pageable);
//
//    @Query("SELECT pgg FROM PhieuGiamGia pgg WHERE " +
//            "pgg.trangThai = 1 AND " +
//            "pgg.ngayKetThuc < :currentTime")
//    List<PhieuGiamGia> findExpiredVouchers(@Param("currentTime") LocalDateTime currentTime);
//
////    @Query("SELECT new com.example.dto.response.VoucherStatisticsDTO(" +
////            "pgg.trangThai, COUNT(pgg)) " +
////            "FROM PhieuGiamGia pgg " +
////            "WHERE pgg.ngayTao BETWEEN :fromDate AND :toDate " +
////            "GROUP BY pgg.trangThai")
////    List<PhieuGiamGiaStatisticsDTO> getStatistics(@Param("fromDate") LocalDateTime fromDate,
////                                                  @Param("toDate") LocalDateTime toDate);
//
//    @Query("SELECT COUNT(pgg) FROM PhieuGiamGia pgg WHERE " +
//            "pgg.trangThai = 1 AND " +
//            "pgg.soLuong > 0 AND " +
//            "pgg.ngayBatDau <= :currentTime AND " +
//            "pgg.ngayKetThuc >= :currentTime")
//    long countActiveVouchers(@Param("currentTime") LocalDateTime currentTime);
//}
