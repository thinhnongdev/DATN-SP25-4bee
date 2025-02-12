package com.example.module_nv_kh.repository;

import com.example.module_nv_kh.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
//    boolean existsByMaNhanVien(String ma_nhan_vien);
//    boolean existsByEmail(String email);
//    boolean existsBySoDienThoai(String so_dien_thoai);
}
