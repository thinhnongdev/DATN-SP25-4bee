package com.example.server.repository.SanPham;

import com.example.server.entity.MauSac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MauSacRepository extends JpaRepository<MauSac,String> {
    @Query( "SELECT u FROM MauSac u where u.tenMau=:ten")
    Optional<MauSac> findByTen(String ten);
    @Query(value = "select * from mau_sac order by ngay_tao desc",nativeQuery = true)
    List<MauSac> findAll();
}
