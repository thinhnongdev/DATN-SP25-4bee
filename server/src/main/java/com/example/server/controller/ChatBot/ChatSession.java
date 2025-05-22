package com.example.server.controller.ChatBot;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_session")
public class ChatSession {

    @Id
    @Column(name = "session_id", nullable = false, length = 255)
    private String sessionId;

    @Column(name = "id_khach_hang", length = 255)
    private String idKhachHang;

    @Column(name = "id_nhan_vien", length = 255)
    private String idNhanVien;

    @Column(name = "id_tai_khoan", length = 255)
    private String idTaiKhoan;

    @Column(name = "id_hoa_don", length = 255)
    private String idHoaDon;

    @Column(name = "context", columnDefinition = "TEXT")
    private String context;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThai trangThai;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_chat", nullable = false)
    private LoaiChat loaiChat;

    @Column(name = "thoi_gian_chuyen_giao")
    private LocalDateTime thoiGianChuyenGiao;

    @CreationTimestamp
    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "ngay_ket_thuc")
    private LocalDateTime ngayKetThuc;

    public enum TrangThai {
        ACTIVE, CLOSED
    }

    public enum LoaiChat {
        BOT, STAFF, MIXED
    }


    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getIdKhachHang() {
        return idKhachHang;
    }

    public void setIdKhachHang(String idKhachHang) {
        this.idKhachHang = idKhachHang;
    }

    public String getIdNhanVien() {
        return idNhanVien;
    }

    public void setIdNhanVien(String idNhanVien) {
        this.idNhanVien = idNhanVien;
    }

    public String getIdTaiKhoan() {
        return idTaiKhoan;
    }

    public void setIdTaiKhoan(String idTaiKhoan) {
        this.idTaiKhoan = idTaiKhoan;
    }

    public String getIdHoaDon() {
        return idHoaDon;
    }

    public void setIdHoaDon(String idHoaDon) {
        this.idHoaDon = idHoaDon;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public TrangThai getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(TrangThai trangThai) {
        this.trangThai = trangThai;
    }

    public LoaiChat getLoaiChat() {
        return loaiChat;
    }

    public void setLoaiChat(LoaiChat loaiChat) {
        this.loaiChat = loaiChat;
    }

    public LocalDateTime getThoiGianChuyenGiao() {
        return thoiGianChuyenGiao;
    }

    public void setThoiGianChuyenGiao(LocalDateTime thoiGianChuyenGiao) {
        this.thoiGianChuyenGiao = thoiGianChuyenGiao;
    }

    public LocalDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(LocalDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public LocalDateTime getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDateTime ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }
}