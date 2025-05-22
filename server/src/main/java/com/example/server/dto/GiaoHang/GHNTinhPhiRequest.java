package com.example.server.dto.GiaoHang;


import lombok.Data;

@Data
public class GHNTinhPhiRequest {
    private int service_type_id; // Dịch vụ tiêu chuẩn
    private int from_district_id;
    private int to_district_id;
    private String to_ward_code;
//    kích thước dành cho đóng gói, vận chuyển
    private int quantity;
    private int height;  // Mặc định
    private int length;  // Mặc định
    private int width;   // Mặc định
    private int weight; // set trọng lượng nhẹ làm mặc định
    private int insurance_value;

    private String hoaDonId;
}

