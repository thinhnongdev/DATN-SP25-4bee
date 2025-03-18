package com.example.server.service.GiaoHang;

import com.example.server.dto.GiaoHang.GHNCuaHangResponse;
import com.example.server.dto.GiaoHang.GHNTinhPhiRequest;
import com.example.server.dto.GiaoHang.GHNTinhPhiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

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


    // Tính phí vận chuyển (Bỏ qua trọng lượng)
    public int tinhPhiVanChuyen(GHNTinhPhiRequest request) {
        GHNCuaHangResponse.CuaHang shop = layDiaChiShop();
        request.setFrom_district_id(shop.getDistrict_id());

        // Đặt giá trị mặc định cho kích thước để GHN không cần trọng lượng
        request.setService_type_id(2);//tiêu chuẩn
        request.setQuantity(1);
        request.setHeight(5);
        request.setLength(30);
        request.setWidth(25);
        request.setWeight(400);  // Đặt về 0 để không ảnh hưởng đến phí
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
//    Lấy danh sách địa chỉ của api GHN
    public List<Map<String, Object>> layDanhSachTinhThanh() {
        String url = ghnApiUrl + "master-data/province";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);

        return (List<Map<String, Object>>) response.getBody().get("data");
    }

    public List<Map<String, Object>> layDanhSachQuanHuyen(int provinceId) {
        String url = ghnApiUrl + "master-data/district?province_id=" + provinceId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);

        return (List<Map<String, Object>>) response.getBody().get("data");
    }

    public List<Map<String, Object>> layDanhSachPhuongXa(int districtId) {
        String url = ghnApiUrl + "master-data/ward?district_id=" + districtId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", ghnApiKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class);

        return (List<Map<String, Object>>) response.getBody().get("data");
    }

}

