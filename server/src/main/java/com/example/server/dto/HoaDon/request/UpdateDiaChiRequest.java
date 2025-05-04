package com.example.server.dto.HoaDon.request;

import lombok.Data;

@Data
public class UpdateDiaChiRequest {
    private String diaChiId;
    private String diaChiCuThe;
    private Object xa; // Change type to Object to handle both String and Integer
    private Object huyen; // Change type to Object to handle both String and Integer
    private Object tinh; // Change type to Object to handle both String and Integer
    private String tenNguoiNhan;
    private String soDienThoai;
    private String customerId;

    // Helper methods to get values properly typed
    public String getDiaChiIdString() {
        return diaChiId;
    }

    public Integer getXaAsInteger() {
        if (xa instanceof Integer) {
            return (Integer) xa;
        } else if (xa instanceof String) {
            try {
                return Integer.parseInt((String) xa);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    public Integer getHuyenAsInteger() {
        if (huyen instanceof Integer) {
            return (Integer) huyen;
        } else if (huyen instanceof String) {
            try {
                return Integer.parseInt((String) huyen);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    public Integer getTinhAsInteger() {
        if (tinh instanceof Integer) {
            return (Integer) tinh;
        } else if (tinh instanceof String) {
            try {
                return Integer.parseInt((String) tinh);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    public String getXaAsString() {
        return xa != null ? xa.toString() : null;
    }

    public String getHuyenAsString() {
        return huyen != null ? huyen.toString() : null;
    }

    public String getTinhAsString() {
        return tinh != null ? tinh.toString() : null;
    }
}