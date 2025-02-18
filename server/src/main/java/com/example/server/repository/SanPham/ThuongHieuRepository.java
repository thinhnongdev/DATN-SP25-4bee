package com.example.server.repository.SanPham;

import com.example.server.entity.ThuongHieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThuongHieuRepository extends JpaRepository<ThuongHieu,String> {
    @Query(value = "select * from thuong_hieu order by ngay_tao desc",nativeQuery = true)
    List<ThuongHieu> findAll();
}
