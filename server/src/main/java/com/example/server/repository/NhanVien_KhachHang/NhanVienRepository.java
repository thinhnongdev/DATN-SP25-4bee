package com.example.server.repository.NhanVien_KhachHang;

import com.example.server.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository

public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
    @Query("SELECT nv FROM NhanVien nv ORDER BY nv.ngayTao DESC")
    List<NhanVien> findAllNhanVienSortedByNgayTao();
    Optional<NhanVien> findByEmail(String email);
}
