package com.example.server.dto.Client.request;

import com.example.server.entity.*;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SanPhamChiTietClientRequest {
     String id;


    String maSanPhamChiTiet;


     Integer soLuong;


     String moTa;


     Boolean trangThai;


     java.math.BigDecimal gia;


     MauSac mauSac;

     ChatLieu chatLieu;


     DanhMuc danhMuc;


     SanPham sanPham;


     KichThuoc kichThuoc;


     ThuongHieu thuongHieu;


     KieuDang kieuDang;


     KieuCuc kieuCuc;


     KieuCoAo kieuCoAo;


     KieuTayAo kieuTayAo;


     KieuCoTayAo kieuCoTayAo;


     HoaTiet hoaTiet;


     KieuTuiAo tuiAo;


     LocalDateTime ngayTao;

    Integer quantity;

}
