package com.example.phieu_giam_gia.repository;
import com.example.phieu_giam_gia.entity.PhieuGiamGiaKhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface PhieuGiamGiaKhachHangRepository extends JpaRepository<PhieuGiamGiaKhachHang, String> {

}

