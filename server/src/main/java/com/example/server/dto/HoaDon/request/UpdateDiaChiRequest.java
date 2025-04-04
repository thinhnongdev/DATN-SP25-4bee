package com.example.server.dto.HoaDon.request;

import lombok.Data;

@Data
public class UpdateDiaChiRequest {
    private String diaChiId;
    private String diaChiCuThe;
    private String xa;
    private String huyen;
    private String tinh;
}
