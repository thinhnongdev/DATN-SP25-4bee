package com.example.server.service.GiaoHang;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Component
@Slf4j
public class AddressCache {
    private final GHNService ghnService;
    private final Map<Integer, String> provinceMap = new HashMap<>();
    private final Map<Integer, String> districtMap = new HashMap<>();
    private final Map<String, String> wardMap = new HashMap<>();

    public AddressCache(GHNService ghnService) {  // Inject GHNService vào constructor
        this.ghnService = ghnService;
    }
    @PostConstruct
    public void loadAddressData() {
        System.out.println("Đang tải danh sách địa chỉ từ GHN...");

        List<Map<String, Object>> provinces = ghnService.layDanhSachTinhThanh();
        for (Map<String, Object> p : provinces) {
            Integer provinceId = (Integer) p.get("id");
            String provinceName = (String) p.get("name");
            provinceMap.put(provinceId, provinceName);

            List<Map<String, Object>> districts = ghnService.layDanhSachQuanHuyen(provinceId);
            for (Map<String, Object> d : districts) {
                Integer districtId = (Integer) d.get("id");
                String districtName = (String) d.get("name");
                districtMap.put(districtId, districtName);


                List<Map<String, Object>> wards = ghnService.layDanhSachPhuongXa(districtId);

                if (wards.isEmpty()) {
                    System.err.println("⚠ Không có xã/phường nào cho huyện ID: " + districtId);
                } else {
                }

                for (Map<String, Object> w : wards) {
                    String wardCode = (String) w.get("id");
                    String wardName = (String) w.get("name");

                    if (wardCode == null || wardName == null) {
                        System.err.println("⚠ Dữ liệu xã/phường không hợp lệ: " + w);
                        continue;
                    }

                    wardMap.put(wardCode, wardName);
                }
            }
        }
        System.out.println("Tải danh sách địa chỉ hoàn tất!");
    }

    public String getProvinceNameById(int provinceId) {
        return provinceMap.getOrDefault(provinceId, "Không xác định");
    }

    public String getDistrictNameById(int districtId) {
        return districtMap.getOrDefault(districtId, "Không xác định");
    }

    public String getWardNameById(String wardCode) {
        return wardMap.getOrDefault(wardCode, "Không xác định");
    }


    public String getFormattedDiaChi(String diaChi) {
        if (diaChi == null || diaChi.isEmpty()) {
            return "Không có địa chỉ";
        }

        String[] parts = diaChi.split(",\\s*");
        if (parts.length < 4) {
            log.error("⚠ Địa chỉ không đúng định dạng: {}", diaChi);
            return "Địa chỉ không hợp lệ";
        }

        try {
            String tinhId = parts[parts.length - 1];
            String huyenId = parts[parts.length - 2];
            String xaId = parts[parts.length - 3];

            // Chuyển đổi `xaId` từ kiểu int sang kiểu String nếu cần
            String diaChiCuThe = String.join(", ", Arrays.copyOfRange(parts, 0, parts.length - 3));

            // Lấy tên từ AddressCache
            String tinhName = getProvinceNameById(Integer.parseInt(tinhId));
            String huyenName = getDistrictNameById(Integer.parseInt(huyenId));
            String xaName = getWardNameById(xaId); // `xaId` được giữ nguyên là String

            if (tinhName == null) tinhName = "Không xác định";
            if (huyenName == null) huyenName = "Không xác định";
            if (xaName == null) xaName = "Không xác định";

            return String.format("%s, %s, %s, %s", diaChiCuThe, xaName, huyenName, tinhName);
        } catch (NumberFormatException e) {
            log.error("⚠ Lỗi khi xử lý địa chỉ: {}", diaChi, e);
            return "Lỗi địa chỉ";
        }
    }

}





