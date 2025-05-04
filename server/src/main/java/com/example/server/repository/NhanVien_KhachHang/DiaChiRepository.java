package com.example.server.repository.NhanVien_KhachHang;

import com.example.server.entity.DiaChi;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiaChiRepository extends JpaRepository<DiaChi, String> {
    //    Lấy địa chỉ mới nhất của khách hàng
    @Query("SELECT d FROM DiaChi d WHERE d.khachHang.id = :khachHangId ORDER BY d.ngayTao DESC")
    Optional<DiaChi> findLatestByKhachHangId(@Param("khachHangId") String khachHangId);

    @Query(value = "select * from dia_chi where id_khach_hang = :idKhachHang and trang_thai=1", nativeQuery = true)
    List<DiaChi> findDiaChiByIdKhachHang(@Param("idKhachHang") String idKhachHang);
    @Modifying
    @Query("UPDATE DiaChi d SET d.trangThai = 0 WHERE d.khachHang.id = :khachHangId")
    void softDeleteByKhachHangId(@Param("khachHangId") String khachHangId);
}
