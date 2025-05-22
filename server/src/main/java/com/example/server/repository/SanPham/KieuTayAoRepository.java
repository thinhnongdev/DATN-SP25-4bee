package com.example.server.repository.SanPham;

import com.example.server.entity.KieuTayAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface KieuTayAoRepository extends JpaRepository<KieuTayAo,String> {
    @Query(value = "select * from kieu_tay_ao order by ngay_tao desc",nativeQuery = true)
    List<KieuTayAo> findAll();
}
