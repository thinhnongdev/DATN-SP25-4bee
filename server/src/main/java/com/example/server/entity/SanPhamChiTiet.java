package com.example.server.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "san_pham_chi_tiet")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SanPhamChiTiet {
    @Id
   @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private String id;

    @Column(name = "ma_san_pham_chi_tiet")
    private String maSanPhamChiTiet;

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "trang_thai")
    private Boolean trangThai;

    @Column(name = "gia")
    private java.math.BigDecimal gia;

    @ManyToOne
    @JoinColumn(name = "id_mau_sac")
    private MauSac mauSac;

    @ManyToOne
    @JoinColumn(name = "id_chat_lieu")
    private ChatLieu chatLieu;

    @ManyToOne
    @JoinColumn(name = "id_danh_muc")
    private DanhMuc danhMuc;

    @ManyToOne
    @JoinColumn(name = "id_san_pham")
    private SanPham sanPham;

    @ManyToOne
    @JoinColumn(name = "id_kich_thuoc")
    private KichThuoc kichThuoc;

    @ManyToOne
    @JoinColumn(name = "id_thuong_hieu")
    private ThuongHieu thuongHieu;

    @ManyToOne
    @JoinColumn(name = "id_kieu_dang")
    private KieuDang kieuDang;

    @ManyToOne
    @JoinColumn(name = "id_kieu_cuc")
    private KieuCuc kieuCuc;

    @ManyToOne
    @JoinColumn(name = "id_kieu_co_ao")
    private KieuCoAo kieuCoAo;

    @ManyToOne
    @JoinColumn(name = "id_kieu_tay_ao")
    private KieuTayAo kieuTayAo;

    @ManyToOne
    @JoinColumn(name = "id_kieu_co_tay_ao")
    private KieuCoTayAo kieuCoTayAo;

    @ManyToOne
    @JoinColumn(name = "id_hoa_tiet")
    private HoaTiet hoaTiet;

    @ManyToOne
    @JoinColumn(name = "id_tui_ao")
    private KieuTuiAo tuiAo;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMaSanPhamChiTiet() {
        return maSanPhamChiTiet;
    }

    public void setMaSanPhamChiTiet(String maSanPhamChiTiet) {
        this.maSanPhamChiTiet = maSanPhamChiTiet;
    }

    public Integer getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Boolean getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(Boolean trangThai) {
        this.trangThai = trangThai;
    }

    public BigDecimal getGia() {
        return gia;
    }

    public void setGia(BigDecimal gia) {
        this.gia = gia;
    }

    public MauSac getMauSac() {
        return mauSac;
    }

    public void setMauSac(MauSac mauSac) {
        this.mauSac = mauSac;
    }

    public ChatLieu getChatLieu() {
        return chatLieu;
    }

    public void setChatLieu(ChatLieu chatLieu) {
        this.chatLieu = chatLieu;
    }

    public DanhMuc getDanhMuc() {
        return danhMuc;
    }

    public void setDanhMuc(DanhMuc danhMuc) {
        this.danhMuc = danhMuc;
    }

    public SanPham getSanPham() {
        return sanPham;
    }

    public void setSanPham(SanPham sanPham) {
        this.sanPham = sanPham;
    }

    public KichThuoc getKichThuoc() {
        return kichThuoc;
    }

    public void setKichThuoc(KichThuoc kichThuoc) {
        this.kichThuoc = kichThuoc;
    }

    public ThuongHieu getThuongHieu() {
        return thuongHieu;
    }

    public void setThuongHieu(ThuongHieu thuongHieu) {
        this.thuongHieu = thuongHieu;
    }

    public KieuDang getKieuDang() {
        return kieuDang;
    }

    public void setKieuDang(KieuDang kieuDang) {
        this.kieuDang = kieuDang;
    }

    public KieuCuc getKieuCuc() {
        return kieuCuc;
    }

    public void setKieuCuc(KieuCuc kieuCuc) {
        this.kieuCuc = kieuCuc;
    }

    public KieuCoAo getKieuCoAo() {
        return kieuCoAo;
    }

    public void setKieuCoAo(KieuCoAo kieuCoAo) {
        this.kieuCoAo = kieuCoAo;
    }

    public KieuTayAo getKieuTayAo() {
        return kieuTayAo;
    }

    public void setKieuTayAo(KieuTayAo kieuTayAo) {
        this.kieuTayAo = kieuTayAo;
    }

    public KieuCoTayAo getKieuCoTayAo() {
        return kieuCoTayAo;
    }

    public void setKieuCoTayAo(KieuCoTayAo kieuCoTayAo) {
        this.kieuCoTayAo = kieuCoTayAo;
    }

    public HoaTiet getHoaTiet() {
        return hoaTiet;
    }

    public void setHoaTiet(HoaTiet hoaTiet) {
        this.hoaTiet = hoaTiet;
    }

    public KieuTuiAo getTuiAo() {
        return tuiAo;
    }

    public void setTuiAo(KieuTuiAo tuiAo) {
        this.tuiAo = tuiAo;
    }
}