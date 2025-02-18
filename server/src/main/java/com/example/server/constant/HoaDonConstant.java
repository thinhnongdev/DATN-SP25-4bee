package com.example.server.constant;

public class HoaDonConstant {
    private HoaDonConstant() {
        throw new IllegalStateException("Constant class");
    }
//Trạng thái đơn hàng
    public static final int TRANG_THAI_CHO_XAC_NHAN = 1;
    public static final int TRANG_THAI_DA_XAC_NHAN = 2;
    public static final int TRANG_THAI_DANG_GIAO = 3;
    public static final int TRANG_THAI_DA_GIAO = 4;
    public static final int TRANG_THAI_DA_HUY = 5;

    public static final String TRANG_THAI_CHO_XAC_NHAN_TEXT = "Chờ xác nhận";
    public static final String TRANG_THAI_DA_XAC_NHAN_TEXT = "Đã xác nhận";
    public static final String TRANG_THAI_DANG_GIAO_TEXT = "Đang giao";
    public static final String TRANG_THAI_DA_GIAO_TEXT = "Đã giao";
    public static final String TRANG_THAI_DA_HUY_TEXT = "Đã hủy";
//Loại hóa đơn
    public static final int ONLINE = 1;
    public static final int TAI_QUAY = 2;

    public static final String ONLINE_TEXT = "Online";
    public static final String TAI_QUAY_TEXT = "Tại quầy";


    public static String getTrangThaiText(Integer trangThai) {
        if (trangThai == null) return "Không xác định";

        return switch (trangThai) {
            case TRANG_THAI_CHO_XAC_NHAN -> TRANG_THAI_CHO_XAC_NHAN_TEXT;
            case TRANG_THAI_DA_XAC_NHAN -> TRANG_THAI_DA_XAC_NHAN_TEXT;
            case TRANG_THAI_DANG_GIAO -> TRANG_THAI_DANG_GIAO_TEXT;
            case TRANG_THAI_DA_GIAO -> TRANG_THAI_DA_GIAO_TEXT;
            case TRANG_THAI_DA_HUY -> TRANG_THAI_DA_HUY_TEXT;
            default -> "Không xác định";
        };
    }

    public static String getLoaiHoaDonText(Integer loaiHoaDon) {
        if (loaiHoaDon == null) return "Không xác định";
        return switch (loaiHoaDon) {
            case ONLINE -> ONLINE_TEXT;
            case TAI_QUAY -> TAI_QUAY_TEXT;
            default -> "Không xác định";
        };
    }
}