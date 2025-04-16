package com.example.server.repository.SanPham;


import com.example.server.entity.SanPhamChiTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamChiTietRepository extends JpaRepository<SanPhamChiTiet, String> {

    @Query(value = "select * from san_pham_chi_tiet  where id_san_pham= :idSanPham order by ngay_tao desc", nativeQuery = true)
    List<SanPhamChiTiet> findByIdSanPham(@Param("idSanPham") String id);

    @Query(value = "select * from san_pham_chi_tiet where ma_san_pham_chi_tiet = :maSanPhamChiTiet", nativeQuery = true)
    Optional<SanPhamChiTiet> findByMaSPCT(@Param("maSanPhamChiTiet") String maSanPhamChiTiet);

    @Query(value = "select * from san_pham_chi_tiet order by ngay_tao desc", nativeQuery = true)
    List<SanPhamChiTiet> getAllSanPhamChiTiet();

    @Query(value = "select sum(so_luong) from san_pham_chi_tiet  where id_san_pham= :idSanPham", nativeQuery = true)
    Integer findSoLuongByIdSanPham(@Param("idSanPham") String id);

    @Query("SELECT spct FROM SanPhamChiTiet spct " +
            "WHERE spct.sanPham.id = :sanPhamId " +
            "AND spct.mauSac.id = :mauSacId " +
            "AND spct.kichThuoc.id = :kichThuocId " +
            "AND spct.chatLieu.id = :chatLieuId " +
            "AND spct.kieuDang.id = :kieuDangId " +
            "AND spct.thuongHieu.id = :thuongHieuId " +
            "AND spct.kieuCoAo.id = :kieuCoAoId " +
            "AND spct.kieuCuc.id = :kieuCucId " +
            "AND spct.kieuTayAo.id = :kieuTayAoId " +
            "AND spct.tuiAo.id = :kieuTuiAoId " +
            "AND spct.kieuCoTayAo.id = :kieuCoTayAoId " +
            "AND spct.danhMuc.id = :danhMucId " +
            "AND spct.hoaTiet.id = :hoaTietId")
    Optional<SanPhamChiTiet> findByThuocTinh(
            @Param("sanPhamId") String sanPhamId,
            @Param("mauSacId") String mauSacId,
            @Param("kichThuocId") String kichThuocId,
            @Param("chatLieuId") String chatLieuId,
            @Param("kieuDangId") String kieuDangId,
            @Param("thuongHieuId") String thuongHieuId,
            @Param("kieuCoAoId") String kieuCoAoId,
            @Param("kieuCucId") String kieuCucId,
            @Param("kieuTayAoId") String kieuTayAoId,
            @Param("kieuTuiAoId") String kieuTuiAoId,
            @Param("kieuCoTayAoId") String kieuCoTayAoId,
            @Param("danhMucId") String danhMucId,
            @Param("hoaTietId") String hoaTietId
    );

}
