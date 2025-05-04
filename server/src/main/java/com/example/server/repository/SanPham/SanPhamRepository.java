package com.example.server.repository.SanPham;


import com.example.server.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham,String> {
    @Query(value = "SELECT * FROM san_pham u order by u.ngay_tao desc", nativeQuery = true)
    List<SanPham> findAll();
    @Query( "SELECT u FROM SanPham u where u.tenSanPham=:ten")
    Optional<SanPham> findByTen(String ten);
}
