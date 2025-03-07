package com.example.server.repository.HoaDon;

import com.example.server.entity.HoaDon;
import com.example.server.entity.SanPhamChiTiet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SanPhamChiTietHoaDonRepository extends JpaRepository<SanPhamChiTiet, String> {

    //    @Query("SELECT s FROM SanPhamChiTiet s WHERE s.sanPham.id = :sanPhamId AND s.trangThai = :trangThai")
//    List<SanPhamChiTiet> findBySanPhamIdAndTrangThai(String sanPhamId, Integer trangThai);
    @Query("SELECT s FROM SanPhamChiTiet s WHERE s.id = :sanPhamChiTietId AND s.trangThai = :trangThai")
    Optional<SanPhamChiTiet> findBySanPhamIdAndTrangThai(@Param("sanPhamChiTietId") String sanPhamChiTietId, @Param("trangThai") Boolean trangThai);

    //    Fix deadlock
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SanPhamChiTiet s WHERE s.id = :id AND s.trangThai = true")
    Optional<SanPhamChiTiet> findBySanPhamIdAndTrangThaiForUpdate(@Param("id") String id);

    @Lock(LockModeType.OPTIMISTIC_FORCE_INCREMENT)
    @Query("SELECT h FROM HoaDon h WHERE h.id = :id")
    Optional<HoaDon> findByIdForUpdate(@Param("id") String id);


    @Query("SELECT h FROM HoaDon h WHERE h.id = :id")
    Optional<HoaDon> findByIdWithoutLock(@Param("id") String id);


    @Query("SELECT sp FROM SanPhamChiTiet sp " +
            "WHERE (:searchTerm IS NULL OR LOWER(sp.sanPham.tenSanPham) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
            "AND (:chatLieu IS NULL OR sp.chatLieu.tenChatLieu = :chatLieu) " +
            "AND (:kieuDang IS NULL OR sp.kieuDang.tenKieuDang = :kieuDang) " +
            "AND (:thuongHieu IS NULL OR sp.thuongHieu.tenThuongHieu = :thuongHieu) " +
            "AND (:kieuCuc IS NULL OR sp.kieuCuc.tenKieuCuc = :kieuCuc) " +
            "AND (:kieuCoAo IS NULL OR sp.kieuCoAo.tenKieuCoAo = :kieuCoAo) " +
            "AND (:kieuCoTayAo IS NULL OR sp.kieuCoTayAo.tenKieuCoTayAo = :kieuCoTayAo) " +
            "AND (:kieuTayAo IS NULL OR sp.kieuTayAo.tenKieuTayAo = :kieuTayAo) " +
            "AND (:kieuTuiAo IS NULL OR sp.tuiAo.tenKieuTuiAo = :kieuTuiAo) " +
            "AND (:danhMuc IS NULL OR sp.danhMuc.tenDanhMuc = :danhMuc) " +
            "AND (:hoaTiet IS NULL OR sp.hoaTiet.tenHoaTiet = :hoaTiet) " +
            "AND (:mauSac IS NULL OR sp.mauSac.tenMau = :mauSac) " +
            "AND (:kichThuoc IS NULL OR sp.kichThuoc.tenKichThuoc = :kichThuoc)")
    List<SanPhamChiTiet> filterProducts(
            @Param("searchTerm") String searchTerm,
            @Param("chatLieu") String chatLieu,
            @Param("kieuDang") String kieuDang,
            @Param("thuongHieu") String thuongHieu,
            @Param("kieuCuc") String kieuCuc,
            @Param("kieuCoAo") String kieuCoAo,
            @Param("kieuCoTayAo") String kieuCoTayAo,
            @Param("kieuTayAo") String kieuTayAo,
            @Param("kieuTuiAo") String kieuTuiAo,
            @Param("danhMuc") String danhMuc,
            @Param("hoaTiet") String hoaTiet,
            @Param("mauSac") String mauSac,
            @Param("kichThuoc") String kichThuoc);

}