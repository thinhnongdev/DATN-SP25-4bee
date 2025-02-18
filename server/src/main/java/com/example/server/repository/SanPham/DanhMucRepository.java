package com.example.server.repository.SanPham;


import com.example.server.entity.DanhMuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface DanhMucRepository extends JpaRepository<DanhMuc,String> {
    @Query(value = "select * from danh_muc order by ngay_tao desc",nativeQuery = true)
    List<DanhMuc> findAll();
}
