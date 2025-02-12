package com.example.phieu_giam_gia.repository;

import com.example.phieu_giam_gia.entity.PhieuGiamGia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuGiamGiaRepository extends JpaRepository<PhieuGiamGia, String> {
    List<PhieuGiamGia> findAllByNgayKetThucBeforeAndTrangThai(Instant dateTime, int trangThai);
    Optional<PhieuGiamGia> findByMaPhieuGiamGiaAndTrangThai(String maPhieuGiamGia, Integer trangThai);

    @Query("SELECT p FROM PhieuGiamGia p ORDER BY p.ngayTao DESC")
    List<PhieuGiamGia> findAllSortedByNgayTao();

    boolean existsByMaPhieuGiamGia(String maPhieuGiamGia);



}
