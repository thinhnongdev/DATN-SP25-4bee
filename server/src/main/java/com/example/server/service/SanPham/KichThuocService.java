package com.example.server.service.SanPham;



import com.example.server.dto.SanPham.request.KichThuocCreationRequest;
import com.example.server.dto.SanPham.request.KichThuocUpdateRequest;
import com.example.server.entity.KichThuoc;

import java.util.List;

public interface KichThuocService {
    List<KichThuoc> getAll();

    KichThuoc saveKichThuoc(KichThuocCreationRequest kichThuocCreationRequest);

    KichThuoc getKichThuocById(String id);

    KichThuoc updateKichThuoc(String id, KichThuocUpdateRequest kichThuocUpdateRequest);
    KichThuoc findByTen(String ten);
}
