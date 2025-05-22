package com.example.server.constant;

public class HoaDonConstant {
    private HoaDonConstant() {
        throw new IllegalStateException("Constant class");
    }
//    Trang thai update hoa don
    public static final int TRANG_THAI_CAP_NHAT_TT = 1;
    public static final String TRANG_THAI_CAP_NHAT_TT_TEXT = "Cập nhật thông tin nguời nhận";

    public static String getTrangThaiCapNhatThongTin(Integer loaiHoaDon) {
        if (loaiHoaDon == null) return "Không xác định";
        return switch (loaiHoaDon) {
            case TRANG_THAI_CAP_NHAT_TT -> TRANG_THAI_CAP_NHAT_TT_TEXT;
            default -> "Không xác định";
        };
    }

    //Trạng thái đơn hàng
    public static final int TRANG_THAI_CHO_XAC_NHAN = 1;
    public static final int TRANG_THAI_DA_XAC_NHAN = 2;
    public static final int TRANG_THAI_CHO_GIAO_HANG = 3;
    public static final int TRANG_THAI_DANG_GIAO = 4;
    public static final int TRANG_THAI_HOAN_THANH = 5;
    public static final int TRANG_THAI_DA_HUY = 6;
    public static final int TRANG_THAI_DA_HOAN_HANG = 7;

    public static final String TRANG_THAI_CHO_XAC_NHAN_TEXT = "Chờ xác nhận";
    public static final String TRANG_THAI_DA_XAC_NHAN_TEXT = "Đã xác nhận";
    public static final String TRANG_THAI_DANG_GIAO_TEXT = "Đang giao";
    public static final String TRANG_THAI_CHO_GIAO_HANG_TEXT = "Chờ giao hàng";
    public static final String TRANG_THAI_HOAN_THANH_TEXT = "Hoàn thành";
    public static final String TRANG_THAI_DA_HUY_TEXT = "Đã hủy";
    public static final String TRANG_THAI_DA_HOAN_HANG_TEXT = "Đã hoàn hàng";
//Loại hóa đơn
    public static final int ONLINE = 1;
    public static final int TAI_QUAY = 2;
    public static final int GIAO_HANG = 3;

    public static final String ONLINE_TEXT = "Online";
    public static final String TAI_QUAY_TEXT = "Tại quầy";
    public static final String GIAO_HANG_TEXT = "Giao hàng";

    public static String getTrangThaiText(Integer trangThai) {
        if (trangThai == null) return "Không xác định";

        return switch (trangThai) {
            case TRANG_THAI_CHO_XAC_NHAN -> TRANG_THAI_CHO_XAC_NHAN_TEXT;
            case TRANG_THAI_DA_XAC_NHAN -> TRANG_THAI_DA_XAC_NHAN_TEXT;
            case TRANG_THAI_CHO_GIAO_HANG -> TRANG_THAI_CHO_GIAO_HANG_TEXT;
            case TRANG_THAI_DANG_GIAO -> TRANG_THAI_DANG_GIAO_TEXT;
            case TRANG_THAI_HOAN_THANH -> TRANG_THAI_HOAN_THANH_TEXT;
            case TRANG_THAI_DA_HUY -> TRANG_THAI_DA_HUY_TEXT;
            case TRANG_THAI_DA_HOAN_HANG -> TRANG_THAI_DA_HOAN_HANG_TEXT;
            default -> "Không xác định";
        };
    }

    public static String getLoaiHoaDonText(Integer loaiHoaDon) {
        if (loaiHoaDon == null) return "Không xác định";
        return switch (loaiHoaDon) {
            case ONLINE -> ONLINE_TEXT;
            case TAI_QUAY -> TAI_QUAY_TEXT;
            case GIAO_HANG -> GIAO_HANG_TEXT;
            default -> "Không xác định";
        };
    }
}