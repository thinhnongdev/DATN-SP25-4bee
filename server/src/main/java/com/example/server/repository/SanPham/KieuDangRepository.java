package com.example.server.repository.SanPham;


import com.example.server.entity.KieuDang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface KieuDangRepository extends JpaRepository<KieuDang,String> {
    @Query(value = "select * from kieu_dang order by ngay_tao desc",nativeQuery = true)
    List<KieuDang> findAll();
}
