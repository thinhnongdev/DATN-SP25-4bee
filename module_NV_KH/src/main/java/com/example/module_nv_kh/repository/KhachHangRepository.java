package com.example.module_nv_kh.repository;

import com.example.module_nv_kh.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    @Query("SELECT k.ma_khach_hang FROM KhachHang k ORDER BY k.id DESC LIMIT 1")
    String findLastCustomerCode();
}
