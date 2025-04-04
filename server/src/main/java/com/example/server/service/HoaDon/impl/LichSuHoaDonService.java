package com.example.server.service.HoaDon.impl;

import com.example.server.dto.HoaDon.request.LichSuHoaDonRequest;
import com.example.server.dto.HoaDon.response.LichSuHoaDonResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.LichSuHoaDon;
import com.example.server.entity.NhanVien;
import com.example.server.mapper.impl.LichSuHoaDonMapper;
import com.example.server.repository.HoaDon.HoaDonRepository;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
import com.example.server.repository.NhanVien_KhachHang.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LichSuHoaDonService {
    private final LichSuHoaDonRepository repository;
    private final LichSuHoaDonMapper mapper;
    private final HoaDonRepository hoaDonRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;
    @Autowired
    private CurrentUserServiceImpl currentUserService;

    public LichSuHoaDonService(LichSuHoaDonRepository repository, LichSuHoaDonMapper mapper, HoaDonRepository hoaDonRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.hoaDonRepository = hoaDonRepository;

    }

    public List<LichSuHoaDonResponse> getByHoaDonId(String hoaDonId) {
        return repository.findByHoaDonId(hoaDonId)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public void saveLichSuHoaDon(LichSuHoaDonRequest request) {
        HoaDon hoaDon = hoaDonRepository.findById(request.getHoaDonId())
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại với ID: " + request.getHoaDonId()));

        // Lấy nhân viên hiện tại từ CurrentUserServiceImpl
        NhanVien nhanVien = currentUserService.getCurrentNhanVien();

        LichSuHoaDon entity = new LichSuHoaDon();
        entity.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        entity.setHoaDon(hoaDon);
        entity.setTrangThai(request.getTrangThai());
        entity.setNgayTao(LocalDateTime.now());
        entity.setNhanVien(nhanVien); // Gán trực tiếp nhân viên lấy từ CurrentUserServiceImpl
        entity.setHanhDong("Cập nhật trạng thái hóa đơn");
        entity.setMoTa(request.getGhiChu() != null ? request.getGhiChu() : "Không có mô tả");

        repository.save(entity);
    }

//    public void saveLichSuHoaDon(LichSuHoaDonRequest request) {
//        // Lấy đối tượng HoaDon từ database
//        HoaDon hoaDon = hoaDonRepository.findById(request.getHoaDonId())
//                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại với ID: " + request.getHoaDonId()));
//
//        // Tạo entity LichSuHoaDon
//        LichSuHoaDon entity = new LichSuHoaDon();
//        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8); // Tạo ID từ UUID
//        entity.setId("LS" + uuid);
////        entity.setId( UUID.randomUUID().toString()); // Tạo ID ngẫu nhiên
//        entity.setHoaDon(hoaDon);
//        entity.setTrangThai(request.getTrangThai());
//
////        NhanVien nhanVien = nhanVienRepository.findById(request.getNhanVien())
////                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại với ID: " + request.getNhanVien()));
////        entity.setNhanVien(nhanVien);
//
//        entity.setNgayTao(LocalDateTime.now());
//        entity.setHanhDong("Cập nhật trạng thái hóa đơn");
//        entity.setMoTa(request.getGhiChu());
//
//        // Lưu vào database
//        repository.save(entity);
//    }

}
