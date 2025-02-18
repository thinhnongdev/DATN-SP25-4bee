package com.example.server.repository.HoaDon;

import com.example.server.dto.HoaDon.response.HoaDonStatisticsDTO;
import com.example.server.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, String>,
        JpaSpecificationExecutor<HoaDon> {

    Optional<HoaDon> findByMaHoaDon(String maHoaDon);

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

    @Query(value = "SELECT *  from hoa_don where trang_thai=1", nativeQuery = true)
    List<HoaDon> getHoaDonCho();
}
