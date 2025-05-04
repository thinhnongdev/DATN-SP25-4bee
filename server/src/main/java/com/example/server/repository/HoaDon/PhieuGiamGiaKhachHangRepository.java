package com.example.server.repository.HoaDon;

import com.example.server.entity.KhachHang;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.entity.PhieuGiamGiaKhachHang;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface PhieuGiamGiaKhachHangRepository extends CrudRepository<PhieuGiamGiaKhachHang, String> {

    // Tìm danh sách khách hàng theo mã phiếu giảm giá
    @Query("SELECT k FROM KhachHang k JOIN PhieuGiamGiaKhachHang pgk ON k.id = pgk.id WHERE pgk.id = :idPhieuGiamGia")
    List<KhachHang> findKhachHangByMaPhieuGiamGia(@Param("idPhieuGiamGia") String idPhieuGiamGia);

    // Tìm danh sách các bản ghi theo id phiếu giảm giá
    @Query("SELECT p FROM PhieuGiamGiaKhachHang p WHERE p.phieuGiamGia.id = :phieuGiamGiaId")
    List<PhieuGiamGiaKhachHang> findByPhieuGiamGiaId(@Param("phieuGiamGiaId") String phieuGiamGiaId);

    // Tìm danh sách các bản ghi theo id khách hàng
    @Query("SELECT p FROM PhieuGiamGiaKhachHang p WHERE p.khachHang.id = :khachHangId")
    List<PhieuGiamGiaKhachHang> findByKhachHangId(@Param("khachHangId") String khachHangId);

    // Xoá tất cả các bản ghi liên quan đến phiếu giảm giá
    @Modifying
    @Transactional
    @Query("DELETE FROM PhieuGiamGiaKhachHang p WHERE p.phieuGiamGia = :phieuGiamGia")
    void deleteAllByPhieuGiamGia(@Param("phieuGiamGia") PhieuGiamGia phieuGiamGia);

    // Xoá phiếu giảm giá khỏi khách hàng theo id phiếu giảm giá và id khách hàng
    @Modifying
    @Transactional
    @Query("DELETE FROM PhieuGiamGiaKhachHang p WHERE p.phieuGiamGia.id = :phieuGiamGiaId AND p.khachHang.id = :khachHangId")
    void deleteByPhieuGiamGiaIdAndKhachHangId(@Param("phieuGiamGiaId") String phieuGiamGiaId, @Param("khachHangId") String khachHangId);

    // Xoá khách hàng khỏi phiếu giảm giá theo mã phiếu giảm giá
    @Modifying
    @Transactional
    @Query("DELETE FROM PhieuGiamGiaKhachHang p WHERE p.phieuGiamGia.maPhieuGiamGia = :maPhieuGiamGia AND p.khachHang.id = :khachHangId")
    void deleteByMaPhieuGiamGiaAndKhachHangId(@Param("maPhieuGiamGia") String maPhieuGiamGia, @Param("khachHangId") String khachHangId);

    // Lấy danh sách khách hàng theo phiếu giảm giá
    @Query("SELECT pgk.khachHang.id FROM PhieuGiamGiaKhachHang pgk WHERE pgk.phieuGiamGia.id = :phieuGiamGiaId")
    Set<String> findCustomerIdsByPhieuGiamGiaId(@Param("phieuGiamGiaId") String phieuGiamGiaId);

    @Query("SELECT p FROM PhieuGiamGiaKhachHang p WHERE p.phieuGiamGia.id = :phieuGiamGiaId AND p.khachHang.id = :khachHangId")
    Optional<PhieuGiamGiaKhachHang> findByPhieuGiamGiaIdAndKhachHangId(
            @Param("phieuGiamGiaId") String phieuGiamGiaId,
            @Param("khachHangId") String khachHangId
    );

    // Đếm số lượng khách hàng của một phiếu giảm giá
    long countByPhieuGiamGiaId(String phieuGiamGiaId);


}
