package com.example.server.dto.GiaoHang;

import lombok.Data;
import java.util.List;

@Data
public class GHNCuaHangResponse {
    private int code;
    private String message;
    private DataResponse data;

    @Data
    public static class DataResponse {
        private int last_offset;
        private List<CuaHang> shops;
    }

    @Data
    public static class CuaHang {
        private int id;            // _id từ JSON của GHN
        private String name;        // Tên shop
        private String phone;       // Số điện thoại shop
        private String address;     // Địa chỉ shop
        private String ward_code;   // Mã phường/xã
        private int district_id;    // ID quận/huyện
    }
}
