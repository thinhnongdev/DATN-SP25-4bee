package com.example.server.repository.SanPham;


import com.example.server.entity.KieuCuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KieuCucRepository extends JpaRepository<KieuCuc,String> {
    boolean existsByTenKieuCuc(String name);
    @Query(value = "select * from kieu_cuc order by ngay_tao desc",nativeQuery = true)
    List<KieuCuc> findAll();
}
