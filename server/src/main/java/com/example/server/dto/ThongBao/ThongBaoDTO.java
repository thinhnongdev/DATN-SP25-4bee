package com.example.server.dto.ThongBao;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ThongBaoDTO {
    private String id;
    private String tieuDe;
    private String noiDung;
    private String maHoaDon;
    private String entityId;
    private String loaiThongBao;
    private Boolean daDoc;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayDoc;
}