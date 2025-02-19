package com.example.server.repository.NhanVien_KhachHang;

import com.example.server.entity.DiaChi;
import com.example.server.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaChiRepository extends JpaRepository<DiaChi, String> {
    List<DiaChi> findByKhachHang(KhachHang khachHang);

    @Query(value = "select * from dia_chi where id_khach_hang = :idKhachHang", nativeQuery = true)
    List<DiaChi> findDiaChiByIdKhachHang(@Param("idKhachHang") String idKhachHang);

}
