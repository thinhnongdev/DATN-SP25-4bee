package com.example.server.service.GiaoHang;

import com.example.server.dto.GiaoHang.GHNCuaHangResponse;
import com.example.server.dto.GiaoHang.GHNTinhPhiRequest;
import com.example.server.dto.GiaoHang.GHNTinhPhiResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.HoaDonChiTiet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


@Service
public class GHNService {

    @Value("${ghn.api.key}")
    private String ghnApiKey;

    @Value("${ghn.shop.id}")
    private String ghnShopId;

    @Value("${ghn.api.url}")
    private String ghnApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Lấy địa chỉ shop từ GHN
    public GHNCuaHangResponse.CuaHang layDiaChiShop() {
        String url = ghnApiUrl + "v2/shop/all";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<GHNCuaHangResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, GHNCuaHangResponse.class);

        //  In JSON trả về để debug
        System.out.println("GHN Response: " + response.getBody());

        // Lấy shop đầu tiên trong danh sách
        return response.getBody().getData().getShops().get(0);
    }


    // Tính phí vận chuyển (bổ sung insurance_value dựa trên giá trị đơn hàng)
    public int tinhPhiVanChuyen(GHNTinhPhiRequest request, HoaDon hoaDon) {
        GHNCuaHangResponse.CuaHang shop = layDiaChiShop();
        request.setFrom_district_id(shop.getDistrict_id());

        // Đặt giá trị mặc định cho kích thước để GHN không cần trọng lượng
        request.setService_type_id(2);//tiêu chuẩn
        request.setQuantity(1);
        request.setHeight(10);
        request.setLength(30);
        request.setWidth(20);
        request.setWeight(1000);  // 1kg mặc định

        // Tính tổng giá trị sản phẩm (không bao gồm giảm giá)
        BigDecimal tongGiaSanPham = calculateProductTotal(hoaDon);

        // Tính và thiết lập giá trị bảo hiểm
        int giaTriBaoHiem = tinhGiaTriBaoHiem(tongGiaSanPham);
        request.setInsurance_value(giaTriBaoHiem);

        String url = ghnApiUrl + "v2/shipping-order/fee";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<GHNTinhPhiRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<GHNTinhPhiResponse> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, GHNTinhPhiResponse.class);

        return response.getBody().getData().getTotal();
    }

//    // Giữ phương thức cũ để đảm bảo tính tương thích ngược
    public int tinhPhiVanChuyen(GHNTinhPhiRequest request) {
        GHNCuaHangResponse.CuaHang shop = layDiaChiShop();
        request.setFrom_district_id(shop.getDistrict_id());

        // Đặt giá trị mặc định cho kích thước để GHN không cần trọng lượng
        request.setService_type_id(2);//tiêu chuẩn
        request.setQuantity(1);
        request.setHeight(10);
        request.setLength(30);
        request.setWidth(20);
        request.setWeight(1000);  // 1kg mặc định
        request.setInsurance_value(0); // bảo hiểm

        String url = ghnApiUrl + "v2/shipping-order/fee";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);
        headers.set("Content-Type", "application/json");

        HttpEntity<GHNTinhPhiRequest> entity = new HttpEntity<>(request, headers);
        ResponseEntity<GHNTinhPhiResponse> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, GHNTinhPhiResponse.class);

        return response.getBody().getData().getTotal();
    }

    /**
     * Tính tổng giá trị sản phẩm trong hóa đơn (không tính giảm giá)
     *
     * @param hoaDon Hóa đơn cần tính tổng
     * @return Tổng giá trị sản phẩm
     */
    private BigDecimal calculateProductTotal(HoaDon hoaDon) {
        if (hoaDon == null || hoaDon.getHoaDonChiTiets() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;

        for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
            if (chiTiet.getTrangThai() == 1) { // Chỉ tính các sản phẩm active
                // Sử dụng giá tại thời điểm thêm nếu có, nếu không thì dùng giá sản phẩm chi tiết
                BigDecimal gia = chiTiet.getGiaTaiThoiDiemThem() != null ?
                        chiTiet.getGiaTaiThoiDiemThem() :
                        chiTiet.getSanPhamChiTiet().getGia();

                BigDecimal thanhTien = gia.multiply(BigDecimal.valueOf(chiTiet.getSoLuong()));
                total = total.add(thanhTien).subtract(hoaDon.getPhieuGiamGia().getGiaTriGiam());
            }
        }

        return total;
    }

    /**
     * Tính giá trị bảo hiểm dựa trên tổng giá trị sản phẩm
     *
     * @param tongGiaTriSanPham Tổng giá trị sản phẩm chưa áp dụng giảm giá
     * @return Giá trị bảo hiểm làm tròn xuống hàng nghìn
     */
    private int tinhGiaTriBaoHiem(BigDecimal tongGiaTriSanPham) {
        if (tongGiaTriSanPham == null || tongGiaTriSanPham.compareTo(BigDecimal.ZERO) <= 0) {
            return 0;
        }

        // Chuyển đổi BigDecimal sang int, làm tròn xuống
        int giaTriBaoHiem = tongGiaTriSanPham.intValue();

        // Làm tròn xuống hàng nghìn gần nhất
        giaTriBaoHiem = (giaTriBaoHiem / 1000) * 1000;

        // Giới hạn giá trị bảo hiểm tối đa (GHN thường có giới hạn)
        int maxInsuranceValue = 20000000; // 20 triệu đồng
        if (giaTriBaoHiem > maxInsuranceValue) {
            giaTriBaoHiem = maxInsuranceValue;
        }

        return giaTriBaoHiem;
    }

    //    Lấy danh sách địa chỉ của api GHN
    public List<Map<String, Object>> layDanhSachTinhThanh() {
        String url = ghnApiUrl + "master-data/province";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);

        // Kiểm tra dữ liệu trả về
        if (response.getBody() == null || !response.getBody().containsKey("data")) {
            System.err.println("GHN API trả về dữ liệu null hoặc không có key 'data'");
            return List.of(); // Trả về danh sách rỗng để tránh lỗi
        }

        List<Map<String, Object>> danhSach = (List<Map<String, Object>>) response.getBody().get("data");

        if (danhSach == null) {
            System.err.println("GHN API không có danh sách tỉnh/thành phố");
            return List.of();
        }

        return danhSach.stream()
                .map(p -> Map.of(
                        "id", p.get("ProvinceID"),
                        "name", p.get("ProvinceName")
                ))
                .toList();
    }

    public List<Map<String, Object>> layDanhSachQuanHuyen(int provinceId) {
        String url = ghnApiUrl + "master-data/district?province_id=" + provinceId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);

        if (response.getBody() == null || !response.getBody().containsKey("data")) {
            System.err.println("GHN API trả về dữ liệu null hoặc không có key 'data' cho quận/huyện");
            return List.of();
        }

        List<Map<String, Object>> danhSach = (List<Map<String, Object>>) response.getBody().get("data");

        if (danhSach == null) {
            System.err.println("GHN API không có danh sách quận/huyện");
            return List.of();
        }

        return danhSach.stream()
                .map(d -> Map.of(
                        "id", d.get("DistrictID"),
                        "name", d.get("DistrictName")
                ))
                .toList();
    }


    public List<Map<String, Object>> layDanhSachPhuongXa(int districtId) {
        String url = ghnApiUrl + "master-data/ward?district_id=" + districtId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);

        // Kiểm tra dữ liệu trả về
        if (response.getBody() == null) {
            System.err.println("GHN API trả về NULL cho districtId: " + districtId);
            return List.of();
        }

        if (!response.getBody().containsKey("data")) {
            return List.of();
        }

        List<Map<String, Object>> danhSach = (List<Map<String, Object>>) response.getBody().get("data");

        if (danhSach == null || danhSach.isEmpty()) {
            return List.of();
        }

        return danhSach.stream()
                .map(w -> Map.of(
                        "id", w.get("WardCode"),
                        "name", w.get("WardName")
                ))
                .toList();
    }


    public String getProvinceName(Long provinceId) {
        String url = ghnApiUrl + "/master-data/province";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        if (response.getBody() != null && response.getBody().get("data") != null) {
            for (Map<String, Object> province : (Iterable<Map<String, Object>>) response.getBody().get("data")) {
                if (province.get("ProvinceID").toString().equals(provinceId.toString())) {
                    return (String) province.get("ProvinceName");
                }
            }
        }
        return "Không tìm thấy tỉnh/thành";
    }

    public String getDistrictName(Long provinceId, Long districtId) {
        String url = ghnApiUrl + "/master-data/district?province_id=" + provinceId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
        if (response.getBody() != null && response.getBody().get("data") != null) {
            for (Map<String, Object> district : (Iterable<Map<String, Object>>) response.getBody().get("data")) {
                if (district.get("DistrictID").toString().equals(districtId.toString())) {
                    return (String) district.get("DistrictName");
                }
            }
        }
        return "Không tìm thấy quận/huyện";
    }

    public String getWardName(Long districtId, String wardCode) {
        String url = ghnApiUrl + "/master-data/ward?district_id=" + districtId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

        if (response.getBody() != null && response.getBody().get("data") != null) {
            for (Map<String, Object> ward : (Iterable<Map<String, Object>>) response.getBody().get("data")) {
                if (ward.get("WardCode").equals(wardCode)) {
                    return (String) ward.get("WardName");
                }
            }
        }
        return "Không tìm thấy phường/xã";
    }
}

