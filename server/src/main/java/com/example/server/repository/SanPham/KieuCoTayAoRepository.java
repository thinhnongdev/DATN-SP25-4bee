package com.example.server.repository.SanPham;

import com.example.server.entity.KieuCoTayAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface KieuCoTayAoRepository extends JpaRepository<KieuCoTayAo,String> {
    @Query(value = "select * from kieu_co_tay_ao order by ngay_tao desc",nativeQuery = true)
    List<KieuCoTayAo> findAll();
}
