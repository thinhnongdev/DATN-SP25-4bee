package com.example.server.repository.SanPham;

import com.example.server.entity.SanPhamChiTiet;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
@Repository
public interface SanPhamChiTietRepository extends JpaRepository<SanPhamChiTiet,String>, JpaSpecificationExecutor<SanPhamChiTiet> {

    @Query(value = "select * from san_pham_chi_tiet  where id_san_pham= :idSanPham order by ngay_tao desc",nativeQuery = true)
    List<SanPhamChiTiet> findByIdSanPham(@Param("idSanPham") String id);
    @Query(value = "select * from san_pham_chi_tiet where ma_san_pham_chi_tiet = :maSanPhamChiTiet", nativeQuery = true)
    Optional<SanPhamChiTiet> findByMaSPCT(@Param("maSanPhamChiTiet") String maSanPhamChiTiet);
    @Query(value = "select * from san_pham_chi_tiet order by ngay_tao desc",nativeQuery = true)
    List<SanPhamChiTiet> getAllSanPhamChiTiet();
    @Query(value = "select sum(so_luong) from san_pham_chi_tiet  where id_san_pham= :idSanPham",nativeQuery = true)
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




    @Query("SELECT hdct.sanPhamChiTiet.id, SUM(hdct.soLuong) as totalQuantity " +
            "FROM HoaDonChiTiet hdct " +
            "GROUP BY hdct.sanPhamChiTiet.id " +
            "ORDER BY SUM(hdct.soLuong) DESC")
    List<Object[]> findTopSellingProducts();

    @Query("SELECT spct FROM SanPhamChiTiet spct " +
            "WHERE (:mauSac IS NULL OR LOWER(spct.mauSac.maMau) LIKE LOWER(CONCAT('%', :mauSac, '%'))) " +
            "AND (:chatLieu IS NULL OR LOWER(spct.chatLieu.tenChatLieu) LIKE LOWER(CONCAT('%', :chatLieu, '%'))) " +
            "AND (:danhMuc IS NULL OR LOWER(spct.danhMuc.tenDanhMuc) LIKE LOWER(CONCAT('%', :danhMuc, '%'))) " +
            "AND (:sanPham IS NULL OR LOWER(spct.sanPham.tenSanPham) LIKE LOWER(CONCAT('%', :sanPham, '%'))) " +
            "AND (:kichThuoc IS NULL OR LOWER(spct.kichThuoc.tenKichThuoc) LIKE LOWER(CONCAT('%', :kichThuoc, '%'))) " +
            "AND (:thuongHieu IS NULL OR LOWER(spct.thuongHieu.tenThuongHieu) LIKE LOWER(CONCAT('%', :thuongHieu, '%'))) " +
            "AND (:kieuDang IS NULL OR LOWER(spct.kieuDang.tenKieuDang) LIKE LOWER(CONCAT('%', :kieuDang, '%'))) " +
            "AND (:kieuCuc IS NULL OR LOWER(spct.kieuCuc.tenKieuCuc) LIKE LOWER(CONCAT('%', :kieuCuc, '%'))) " +
            "AND (:kieuCoAo IS NULL OR LOWER(spct.kieuCoAo.tenKieuCoAo) LIKE LOWER(CONCAT('%', :kieuCoAo, '%'))) " +
            "AND (:kieuTayAo IS NULL OR LOWER(spct.kieuTayAo.tenKieuTayAo) LIKE LOWER(CONCAT('%', :kieuTayAo, '%'))) " +
            "AND (:kieuCoTayAo IS NULL OR LOWER(spct.kieuCoTayAo.tenKieuCoTayAo) LIKE LOWER(CONCAT('%', :kieuCoTayAo, '%'))) " +
            "AND (:hoaTiet IS NULL OR LOWER(spct.hoaTiet.tenHoaTiet) LIKE LOWER(CONCAT('%', :hoaTiet, '%'))) " +
            "AND (:tuiAo IS NULL OR LOWER(spct.tuiAo.tenKieuTuiAo) LIKE LOWER(CONCAT('%', :tuiAo, '%'))) " +
            "AND spct.soLuong > 0 " +
            "AND (:minPrice IS NULL OR spct.gia >= :minPrice) " +
            "AND (:maxPrice IS NULL OR spct.gia <= :maxPrice)")
    List<SanPhamChiTiet> findProductsByAttributes(
            @Param("mauSac") String mauSac,
            @Param("chatLieu") String chatLieu,
            @Param("danhMuc") String danhMuc,
            @Param("sanPham") String sanPham,
            @Param("kichThuoc") String kichThuoc,
            @Param("thuongHieu") String thuongHieu,
            @Param("kieuDang") String kieuDang,
            @Param("kieuCuc") String kieuCuc,
            @Param("kieuCoAo") String kieuCoAo,
            @Param("kieuTayAo") String kieuTayAo,
            @Param("kieuCoTayAo") String kieuCoTayAo,
            @Param("hoaTiet") String hoaTiet,
            @Param("tuiAo") String tuiAo,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);

    SanPhamChiTiet findByMaSanPhamChiTiet(String maSanPhamChiTiet);

    default List<SanPhamChiTiet> findProductsByAttributes(Map<String, Object> conditions) {
        return findAll((Root<SanPhamChiTiet> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (conditions.containsKey("mauSac")) {
                predicates.add(cb.like(cb.lower(root.get("mauSac").get("maMau")), "%" + ((String) conditions.get("mauSac")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("chatLieu")) {
                predicates.add(cb.like(cb.lower(root.get("chatLieu").get("tenChatLieu")), "%" + ((String) conditions.get("chatLieu")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("danhMuc")) {
                predicates.add(cb.like(cb.lower(root.get("danhMuc").get("tenDanhMuc")), "%" + ((String) conditions.get("danhMuc")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("sanPham")) {
                predicates.add(cb.like(cb.lower(root.get("sanPham").get("tenSanPham")), "%" + ((String) conditions.get("sanPham")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kichThuoc")) {
                predicates.add(cb.like(cb.lower(root.get("kichThuoc").get("tenKichThuoc")), "%" + ((String) conditions.get("kichThuoc")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("thuongHieu")) {
                predicates.add(cb.like(cb.lower(root.get("thuongHieu").get("tenThuongHieu")), "%" + ((String) conditions.get("thuongHieu")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuDang")) {
                predicates.add(cb.like(cb.lower(root.get("kieuDang").get("tenKieuDang")), "%" + ((String) conditions.get("kieuDang")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuCuc")) {
                predicates.add(cb.like(cb.lower(root.get("kieuCuc").get("tenKieuCuc")), "%" + ((String) conditions.get("kieuCuc")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuCoAo")) {
                predicates.add(cb.like(cb.lower(root.get("kieuCoAo").get("tenKieuCoAo")), "%" + ((String) conditions.get("kieuCoAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuTayAo")) {
                predicates.add(cb.like(cb.lower(root.get("kieuTayAo").get("tenKieuTayAo")), "%" + ((String) conditions.get("kieuTayAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuCoTayAo")) {
                predicates.add(cb.like(cb.lower(root.get("kieuCoTayAo").get("tenKieuCoTayAo")), "%" + ((String) conditions.get("kieuCoTayAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("hoaTiet")) {
                predicates.add(cb.like(cb.lower(root.get("hoaTiet").get("tenHoaTiet")), "%" + ((String) conditions.get("hoaTiet")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("tuiAo")) {
                predicates.add(cb.like(cb.lower(root.get("tuiAo").get("tenKieuTuiAo")), "%" + ((String) conditions.get("tuiAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("minPrice")) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("gia"), (BigDecimal) conditions.get("minPrice")));
            }
            if (conditions.containsKey("maxPrice")) {
                predicates.add(cb.lessThanOrEqualTo(root.get("gia"), (BigDecimal) conditions.get("maxPrice")));
            }

            predicates.add(cb.greaterThan(root.get("soLuong"), 0));

            return cb.and(predicates.toArray(new Predicate[0]));
        });
    }

    default Page<SanPhamChiTiet> findProducts(Map<String, Object> conditions, Pageable pageable) {
        return findAll((Root<SanPhamChiTiet> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (conditions.containsKey("mauSac")) {
                predicates.add(cb.like(cb.lower(root.get("mauSac").get("maMau")), "%" + ((String) conditions.get("mauSac")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("chatLieu")) {
                predicates.add(cb.like(cb.lower(root.get("chatLieu").get("tenChatLieu")), "%" + ((String) conditions.get("chatLieu")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("danhMuc")) {
                predicates.add(cb.like(cb.lower(root.get("danhMuc").get("tenDanhMuc")), "%" + ((String) conditions.get("danhMuc")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("sanPham")) {
                predicates.add(cb.like(cb.lower(root.get("sanPham").get("tenSanPham")), "%" + ((String) conditions.get("sanPham")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kichThuoc")) {
                predicates.add(cb.like(cb.lower(root.get("kichThuoc").get("tenKichThuoc")), "%" + ((String) conditions.get("kichThuoc")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("thuongHieu")) {
                predicates.add(cb.like(cb.lower(root.get("thuongHieu").get("tenThuongHieu")), "%" + ((String) conditions.get("thuongHieu")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuDang")) {
                predicates.add(cb.like(cb.lower(root.get("kieuDang").get("tenKieuDang")), "%" + ((String) conditions.get("kieuDang")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuCuc")) {
                predicates.add(cb.like(cb.lower(root.get("kieuCuc").get("tenKieuCuc")), "%" + ((String) conditions.get("kieuCuc")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuCoAo")) {
                predicates.add(cb.like(cb.lower(root.get("kieuCoAo").get("tenKieuCoAo")), "%" + ((String) conditions.get("kieuCoAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuTayAo")) {
                predicates.add(cb.like(cb.lower(root.get("kieuTayAo").get("tenKieuTayAo")), "%" + ((String) conditions.get("kieuTayAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("kieuCoTayAo")) {
                predicates.add(cb.like(cb.lower(root.get("kieuCoTayAo").get("tenKieuCoTayAo")), "%" + ((String) conditions.get("kieuCoTayAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("hoaTiet")) {
                predicates.add(cb.like(cb.lower(root.get("hoaTiet").get("tenHoaTiet")), "%" + ((String) conditions.get("hoaTiet")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("tuiAo")) {
                predicates.add(cb.like(cb.lower(root.get("tuiAo").get("tenKieuTuiAo")), "%" + ((String) conditions.get("tuiAo")).toLowerCase() + "%"));
            }
            if (conditions.containsKey("minPrice")) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("gia"), (BigDecimal) conditions.get("minPrice")));
            }
            if (conditions.containsKey("maxPrice")) {
                predicates.add(cb.lessThanOrEqualTo(root.get("gia"), (BigDecimal) conditions.get("maxPrice")));
            }

            predicates.add(cb.greaterThan(root.get("soLuong"), 0));

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }
}

