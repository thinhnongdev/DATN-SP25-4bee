package com.example.server.repository.SanPham;

import com.example.server.entity.KieuTuiAo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface KieuTuiAoRepository extends JpaRepository<KieuTuiAo,String> {
    @Query(value = "select * from kieu_tui_ao order by ngay_tao desc",nativeQuery = true)
    List<KieuTuiAo> findAll();
}
