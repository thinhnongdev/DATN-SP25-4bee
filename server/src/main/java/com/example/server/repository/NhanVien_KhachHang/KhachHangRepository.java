package com.example.server.repository.NhanVien_KhachHang;

import com.example.server.entity.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String>,
        JpaSpecificationExecutor<KhachHang> {

    Optional<KhachHang> findByMaKhachHang(String maKhachHang);

    Optional<KhachHang> findBySoDienThoai(String soDienThoai);

    Optional<KhachHang> findByEmail(String email);

    @Query("SELECT kh FROM KhachHang kh WHERE " +
            "(:keyword IS NULL OR " +
            "LOWER(kh.maKhachHang) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(kh.tenKhachHang) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(kh.soDienThoai) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(kh.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:trangThai IS NULL OR kh.trangThai = :trangThai)")
    Page<KhachHang> search(@Param("keyword") String keyword,
                           @Param("trangThai") Boolean trangThai,
                           Pageable pageable);

    boolean existsBySoDienThoai(String soDienThoai);

    boolean existsByEmail(String email);

    Optional<KhachHang> findByTaiKhoan_Id(String taiKhoanId);

    boolean existsByMaKhachHang(String maKhachHang);

    @Query("SELECT COUNT(kh) FROM KhachHang kh WHERE kh.trangThai = true")
    long countActiveCustomers();

    List<KhachHang> findByIdIn(List<String> ids);

    @Query("SELECT kh FROM KhachHang kh ORDER BY kh.ngayTao DESC")
    List<KhachHang> findAllKhachHangSortedByNgayTao();
}