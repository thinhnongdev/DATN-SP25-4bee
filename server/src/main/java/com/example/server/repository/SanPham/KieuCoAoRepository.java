package com.example.server.repository.SanPham;

import com.example.server.entity.KieuCoAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface KieuCoAoRepository extends JpaRepository<KieuCoAo,String> {
    @Query(value = "select * from kieu_co_ao order by ngay_tao desc",nativeQuery = true)
    List<KieuCoAo> findAll();
}
