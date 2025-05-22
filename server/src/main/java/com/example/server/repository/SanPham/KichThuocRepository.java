package com.example.server.repository.SanPham;


import com.example.server.entity.KichThuoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface KichThuocRepository extends JpaRepository<KichThuoc,String> {
    @Query( "SELECT u FROM KichThuoc u where u.tenKichThuoc=:ten")
    Optional<KichThuoc> findByTen(String ten);
    @Query(value = "select * from kich_thuoc order by ngay_tao desc",nativeQuery = true)
    List<KichThuoc> findAll();
}
