package com.example.phieu_giam_gia.repository;

import com.example.phieu_giam_gia.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    List<KhachHang> findByIdIn(List<String> ids);
}
