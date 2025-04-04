package com.example.server.repository.SanPham;


import com.example.server.entity.SanPhamChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamChiTietRepository extends JpaRepository<SanPhamChiTiet,String> {

    @Query(value = "select * from san_pham_chi_tiet  where id_san_pham= :idSanPham order by ngay_tao desc",nativeQuery = true)
    List<SanPhamChiTiet> findByIdSanPham(@Param("idSanPham") String id);
    @Query(value = "select * from san_pham_chi_tiet where ma_san_pham_chi_tiet = :maSanPhamChiTiet", nativeQuery = true)
    Optional<SanPhamChiTiet> findByMaSPCT(@Param("maSanPhamChiTiet") String maSanPhamChiTiet);
    @Query(value = "select * from san_pham_chi_tiet order by ngay_tao desc",nativeQuery = true)
    List<SanPhamChiTiet> getAllSanPhamChiTiet();
    @Query(value = "select sum(so_luong) from san_pham_chi_tiet  where id_san_pham= :idSanPham",nativeQuery = true)
    Integer findSoLuongByIdSanPham(@Param("idSanPham") String id);
}
