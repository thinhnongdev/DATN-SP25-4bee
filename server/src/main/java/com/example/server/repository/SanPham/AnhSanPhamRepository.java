package com.example.server.repository.SanPham;

import com.example.server.entity.AnhSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AnhSanPhamRepository extends JpaRepository<AnhSanPham,String> {
    @Query( "SELECT u FROM AnhSanPham u where u.sanPhamChiTiet.id=:id")
    List<AnhSanPham>  findByIdSPCT(String id);
    @Modifying
    @Transactional
    @Query("DELETE FROM AnhSanPham u WHERE u.sanPhamChiTiet.id = :id")
    void deleteBySanPhamChiTietId(@Param("id") String id);
}
