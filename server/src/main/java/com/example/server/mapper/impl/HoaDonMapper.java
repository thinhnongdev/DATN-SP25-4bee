package com.example.server.mapper.impl;

import com.example.server.constant.HoaDonConstant;
import com.example.server.dto.HoaDon.request.HoaDonRequest;
import com.example.server.dto.HoaDon.response.*;
import com.example.server.entity.*;
import com.example.server.exception.ResourceNotFoundException;
import com.example.server.mapper.interfaces.IHoaDonMapper;
import com.example.server.repository.PhieuGiamGia.PhieuGiamGiaRepository;
import com.example.server.repository.HoaDon.SanPhamChiTietHoaDonRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

//@Component
//@RequiredArgsConstructor
//public class HoaDonMapper implements IHoaDonMapper {
//
//    private final KhachHangRepository khachHangRepository;
//    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
//    private final SanPhamChiTietRepository sanPhamChiTietRepository;
//
//    @Override
//    public HoaDon requestToEntity(HoaDonRequest request) {
//        if (request == null) return null;
//
//        HoaDon hoaDon = new HoaDon();
//        updateEntityFromRequest(request, hoaDon);
//
//        // Ánh xạ chi tiết hóa đơn
//        if (request.getHoaDonChiTiets() != null) {
//            List<HoaDonChiTiet> chiTietList = request.getHoaDonChiTiets().stream()
//                    .map(this::mapRequestToHoaDonChiTiet)
//                    .collect(Collectors.toList());
//            hoaDon.setHoaDonChiTiets(chiTietList);
//        }
//
//        // Ánh xạ phương thức thanh toán
//        if (request.getPhuongThucThanhToans() != null) {
//            List<ThanhToanHoaDon> thanhToans = request.getPhuongThucThanhToans().stream()
//                    .map(phuongThuc -> mapPhuongThucThanhToan(phuongThuc, hoaDon)) // Sử dụng lambda để truyền `hoaDon`
//                    .collect(Collectors.toList());
//            thanhToans.forEach(thanhToan -> thanhToan.setHoaDon(hoaDon)); // Gắn hóa đơn
//            hoaDon.setThanhToanHoaDons(thanhToans); // Cập nhật danh sách thanh toán
//        }
//        return hoaDon;
//    }
//
//    private HoaDonChiTiet mapRequestToHoaDonChiTiet(HoaDonChiTietResponse chiTietRequest) {
//        if (chiTietRequest == null) return null;
//
//        SanPhamChiTiet sanPhamChiTiet = findSanPhamChiTietById(chiTietRequest.getSanPhamChiTietId());
//
//        return HoaDonChiTiet.builder()
//                .soLuong(chiTietRequest.getSoLuong())
//                .trangThai(chiTietRequest.getTrangThai())
//                .sanPhamChiTiet(sanPhamChiTiet)
//                .build();
//    }
//
//    private SanPhamChiTiet findSanPhamChiTietById(String id) {
//        return sanPhamChiTietRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm chi tiết không tồn tại với ID: " + id));
//    }
//
//    @Override
//    public HoaDonResponse entityToResponse(HoaDon hoaDon) {
//        if (hoaDon == null) return null;
//
//        return HoaDonResponse.builder()
//                .id(hoaDon.getId())
//                .maHoaDon(hoaDon.getMaHoaDon())
//                .tenNguoiNhan(hoaDon.getTenNguoiNhan())
//                .loaiHoaDon(hoaDon.getLoaiHoaDon())
//                .soDienThoai(hoaDon.getSoDienThoai())
//                .emailNguoiNhan(hoaDon.getEmailNguoiNhan())
//                .diaChi(hoaDon.getDiaChi())
//                .trangThaiGiaoHang(hoaDon.getTrangThaiGiaoHang())
//                .thoiGianGiaoHang(hoaDon.getThoiGianGiaoHang())
//                .thoiGianNhanHang(hoaDon.getThoiGianNhanHang())
//                .tongTien(hoaDon.getTongTien())
//                .ghiChu(hoaDon.getGhiChu())
//                .trangThai(hoaDon.getTrangThai())
//                .ngayTao(hoaDon.getNgayTao())
//                .nhanVien(mapNhanVienToResponse(hoaDon.getNhanVien()))
//                .khachHang(mapKhachHangToResponse(hoaDon.getKhachHang()))
//                .phieuGiamGia(mapPhieuGiamGiaToResponse(hoaDon.getPhieuGiamGia()))
//                .hoaDonChiTiets(mapHoaDonChiTietToResponse(hoaDon.getHoaDonChiTiets()))
//                .build();
//    }
//
//    private List<HoaDonChiTietResponse> mapHoaDonChiTietToResponse(List<HoaDonChiTiet> chiTiets) {
//        if (chiTiets == null || chiTiets.isEmpty()) return Collections.emptyList();
//
//        return chiTiets.stream()
//                .map(this::mapChiTietToResponse)
//                .collect(Collectors.toList());
//    }
//
//    private HoaDonChiTietResponse mapChiTietToResponse(HoaDonChiTiet chiTiet) {
//        if (chiTiet == null) return null;
//
//        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
//        SanPham sanPham = sanPhamChiTiet.getSanPham();
//
//        return HoaDonChiTietResponse.builder()
//                .id(chiTiet.getId())
//                .sanPhamChiTietId(sanPhamChiTiet.getId())
//                .tenSanPham(sanPham.getTenSanPham())
//                .maSanPham(sanPham.getMaSanPham())
//                .soLuong(chiTiet.getSoLuong())
//                .gia(sanPhamChiTiet.getGia())
//                .thanhTien(sanPhamChiTiet.getGia().multiply(BigDecimal.valueOf(chiTiet.getSoLuong())))
//                .trangThai(chiTiet.getTrangThai())
//                .build();
//    }
//
//    @Override
//    public void updateEntityFromRequest(HoaDonRequest request, HoaDon hoaDon) {
//        if (request == null || hoaDon == null) return;
//
//        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
//        hoaDon.setSoDienThoai(request.getSoDienThoai());
//        hoaDon.setEmailNguoiNhan(request.getEmailNguoiNhan());
//        hoaDon.setDiaChi(request.getDiaChi());
//        hoaDon.setLoaiHoaDon(request.getLoaiHoaDon() != null ? request.getLoaiHoaDon() : HoaDonConstant.ONLINE
//        );
////        hoaDon.setTongTien(request.getTongTien());
//        hoaDon.setGhiChu(request.getGhiChu());
//
//        if (request.getIdKhachHang() != null) {
//            KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
//                    .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại với ID: " + request.getIdKhachHang()));
//            hoaDon.setKhachHang(khachHang);
//        }
//
//        if (request.getIdPhieuGiamGia() != null) {
//            PhieuGiamGia phieuGiamGia = phieuGiamGiaRepository.findById(request.getIdPhieuGiamGia())
//                    .orElseThrow(() -> new ResourceNotFoundException("Phiếu giảm giá không tồn tại với ID: " + request.getIdPhieuGiamGia()));
//            hoaDon.setPhieuGiamGia(phieuGiamGia);
//        }
//
//        if (request.getPhuongThucThanhToans() != null) {
//            List<ThanhToanHoaDon> thanhToans = request.getPhuongThucThanhToans().stream()
//                    .map(phuongThuc -> mapPhuongThucThanhToan(phuongThuc, hoaDon)) // Sử dụng lambda để truyền `hoaDon`
//                    .collect(Collectors.toList());
//            thanhToans.forEach(thanhToan -> thanhToan.setHoaDon(hoaDon)); // Gắn hóa đơn
//            hoaDon.setThanhToanHoaDons(thanhToans); // Cập nhật danh sách thanh toán
//        }
//
//    }
//
//    private KhachHangResponse mapKhachHangToResponse(KhachHang khachHang) {
//        if (khachHang == null) return null;
//
//        return KhachHangResponse.builder()
//                .id(khachHang.getId())
//                .maKhachHang(khachHang.getMaKhachHang())
//                .tenKhachHang(khachHang.getTenKhachHang())
//                .soDienThoai(khachHang.getSoDienThoai())
//                .email(khachHang.getEmail())
//                .build();
//    }
//    @Override
//    public ThanhToanHoaDon mapPhuongThucThanhToan(PhuongThucThanhToan phuongThuc, HoaDon hoaDon) {
//        if (phuongThuc == null) return null;
//
//        ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
//        thanhToan.setId("TT" + UUID.randomUUID().toString().replace("-", "").substring(0, 8)); // Generate ID
//        thanhToan.setHoaDon(hoaDon); // Link HoaDon
//        thanhToan.setPhuongThucThanhToan(phuongThuc);
//        thanhToan.setMoTa(phuongThuc.getMoTa());
//        thanhToan.setTrangThai(determineTrangThai(phuongThuc.getId())); // Determine status
//        return thanhToan;
//    }
//
//
//    // Phương thức xác định trạng thái dựa trên ID
//    private int determineTrangThai(String phuongThucId) {
//        if ("PTTT001".equals(phuongThucId)) {
//            return 1; // Trạng thái 1
//        } else if ("PTTT002".equals(phuongThucId) || "PTTT003".equals(phuongThucId)) {
//            return 2; // Trạng thái 2
//        } else {
//            return 0; // Trạng thái mặc định
//        }
//    }
//
//    private NhanVienResponse mapNhanVienToResponse(NhanVien nhanVien){
//        if (nhanVien == null) return null;
//
//        return NhanVienResponse.builder()
//                .id(nhanVien.getId())
//                .maNhanVien(nhanVien.getMaNhanVien())
//                .tenNhanVien(nhanVien.getTenNhanVien())
//                .build();
//    }
//
//    private PhieuGiamGiaResponse mapPhieuGiamGiaToResponse(PhieuGiamGia phieuGiamGia) {
//        if (phieuGiamGia == null) return null;
//
//        return PhieuGiamGiaResponse.builder()
//                .id(phieuGiamGia.getId())
//                .maPhieuGiamGia(phieuGiamGia.getMaPhieuGiamGia())
//                .tenPhieuGiamGia(phieuGiamGia.getTenPhieuGiamGia())
//                .giaTriGiam(phieuGiamGia.getGiaTriGiam())
//                .build();
//    }
//}
@Component
@RequiredArgsConstructor
public class HoaDonMapper implements IHoaDonMapper {

    private final KhachHangRepository khachHangRepository;
    private final PhieuGiamGiaRepository phieuGiamGiaRepository;
    private final SanPhamChiTietHoaDonRepository sanPhamChiTietHoaDonRepository;

    @Override
    public HoaDon requestToEntity(HoaDonRequest request) {
        if (request == null) return null;

        HoaDon hoaDon = new HoaDon();
        updateEntityFromRequest(request, hoaDon);

        // Ánh xạ chi tiết hóa đơn
        if (request.getHoaDonChiTiets() != null) {
            List<HoaDonChiTiet> chiTietList = request.getHoaDonChiTiets().stream()
                    .map(this::mapRequestToHoaDonChiTiet)
                    .collect(Collectors.toList());
            hoaDon.setHoaDonChiTiets(chiTietList);
        }

        // Ánh xạ phương thức thanh toán
        if (request.getPhuongThucThanhToans() != null) {
            List<ThanhToanHoaDon> thanhToans = request.getPhuongThucThanhToans().stream()
                    .map(phuongThuc -> mapPhuongThucThanhToan(phuongThuc, hoaDon))
                    .collect(Collectors.toList());
            thanhToans.forEach(thanhToan -> thanhToan.setHoaDon(hoaDon));
            hoaDon.setThanhToanHoaDons(thanhToans);
        }
        return hoaDon;
    }

    private HoaDonChiTiet mapRequestToHoaDonChiTiet(HoaDonChiTietResponse chiTietRequest) {
        if (chiTietRequest == null) return null;

        SanPhamChiTiet sanPhamChiTiet = findSanPhamChiTietById(chiTietRequest.getSanPhamChiTietId());

        return HoaDonChiTiet.builder()
                .soLuong(chiTietRequest.getSoLuong())
                .trangThai(chiTietRequest.getTrangThai())
                .sanPhamChiTiet(sanPhamChiTiet)
                .build();
    }

    private SanPhamChiTiet findSanPhamChiTietById(String id) {
        return sanPhamChiTietHoaDonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm chi tiết không tồn tại với ID: " + id));
    }

    @Override
    public HoaDonResponse entityToResponse(HoaDon hoaDon) {
        if (hoaDon == null) return null;

        // Tách địa chỉ thành các phần riêng biệt nếu có
        String diaChi = hoaDon.getDiaChi();
        String tinh = "", huyen = "", xa = "", moTa = "";

        if (diaChi != null && !diaChi.isEmpty()) {
            String[] parts = diaChi.split(", ");
            int length = parts.length;

            if (length > 0) moTa = parts[0];   // Mô tả chi tiết (VD: "Số 22")
            if (length > 1) xa = parts[1];      // Xã/Phường
            if (length > 2) huyen = parts[2];   // Quận/Huyện
            if (length > 3) tinh = parts[3];    // Tỉnh/Thành phố
        }

        return HoaDonResponse.builder()
                .id(hoaDon.getId())
                .maHoaDon(hoaDon.getMaHoaDon())
                .tenNguoiNhan(hoaDon.getTenNguoiNhan())
                .loaiHoaDon(hoaDon.getLoaiHoaDon())
                .soDienThoai(hoaDon.getSoDienThoai())
                .emailNguoiNhan(hoaDon.getEmailNguoiNhan())
                .diaChi(diaChi) // Giữ nguyên địa chỉ đầy đủ
                .tinh(tinh)
                .huyen(huyen)
                .xa(xa)
                .moTa(moTa)
                .trangThaiGiaoHang(hoaDon.getTrangThaiGiaoHang())
                .thoiGianGiaoHang(hoaDon.getThoiGianGiaoHang())
                .thoiGianNhanHang(hoaDon.getThoiGianNhanHang())
                .tongTien(hoaDon.getTongTien())
                .ghiChu(hoaDon.getGhiChu())
                .trangThai(hoaDon.getTrangThai())
                .ngayTao(hoaDon.getNgayTao())
                .nhanVien(mapNhanVienToResponse(hoaDon.getNhanVien()))
                .khachHang(mapKhachHangToResponse(hoaDon.getKhachHang()))
                .phieuGiamGia(mapPhieuGiamGiaToResponse(hoaDon.getPhieuGiamGia()))
                .hoaDonChiTiets(mapHoaDonChiTietToResponse(hoaDon.getHoaDonChiTiets()))
                .build();
    }



    private List<HoaDonChiTietResponse> mapHoaDonChiTietToResponse(List<HoaDonChiTiet> chiTiets) {
        if (chiTiets == null || chiTiets.isEmpty()) return Collections.emptyList();

        return chiTiets.stream()
                .map(this::mapChiTietToResponse)
                .collect(Collectors.toList());
    }

    private HoaDonChiTietResponse mapChiTietToResponse(HoaDonChiTiet chiTiet) {
        if (chiTiet == null) return null;

        SanPhamChiTiet sanPhamChiTiet = chiTiet.getSanPhamChiTiet();
        SanPham sanPham = sanPhamChiTiet.getSanPham();

        return HoaDonChiTietResponse.builder()
                .id(chiTiet.getId())
                .sanPhamChiTietId(sanPhamChiTiet.getId())
                .tenSanPham(sanPham.getTenSanPham())
                .maSanPham(sanPham.getMaSanPham())
                .soLuong(chiTiet.getSoLuong())
                .gia(sanPhamChiTiet.getGia())
                .thanhTien(sanPhamChiTiet.getGia().multiply(BigDecimal.valueOf(chiTiet.getSoLuong())))
                .trangThai(chiTiet.getTrangThai())
                .build();
    }

    private List<DiaChiResponse> mapDiaChiListToResponse(List<DiaChi> diaChiList) {
        if (diaChiList == null || diaChiList.isEmpty()) return Collections.emptyList();

        return diaChiList.stream()
                .map(this::mapDiaChiToResponse)
                .collect(Collectors.toList());
    }

    private DiaChiResponse mapDiaChiToResponse(DiaChi diaChi) {
        if (diaChi == null) return null;

        return DiaChiResponse.builder()
                .id(diaChi.getId())
                .xa(diaChi.getXa())
                .huyen(diaChi.getHuyen())
                .tinh(diaChi.getTinh())
                .moTa(diaChi.getMoTa())
                .trangThai(diaChi.getTrangThai())
                .ngayTao(diaChi.getNgayTao())
                .ngaySua(diaChi.getNgaySua())
                .nguoiTao(diaChi.getNguoiTao())
                .nguoiSua(diaChi.getNguoiSua())
                .build();
    }

    @Override
    public void updateEntityFromRequest(HoaDonRequest request, HoaDon hoaDon) {
        if (request == null || hoaDon == null) return;

        // Cập nhật các trường từ request
        hoaDon.setTenNguoiNhan(request.getTenNguoiNhan());
        hoaDon.setSoDienThoai(request.getSoDienThoai());
        hoaDon.setEmailNguoiNhan(request.getEmailNguoiNhan());
        hoaDon.setGhiChu(request.getGhiChu());
        // Chỉ cập nhật địa chỉ nếu có thay đổi
        if (request.getDiaChi() != null) {
            hoaDon.setDiaChi(request.getDiaChi());
        }

        hoaDon.setLoaiHoaDon(request.getLoaiHoaDon() != null ? request.getLoaiHoaDon() : HoaDonConstant.ONLINE
        );


        if (request.getIdKhachHang() != null) {
            KhachHang khachHang = khachHangRepository.findById(request.getIdKhachHang())
                    .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại với ID: " + request.getIdKhachHang()));
            hoaDon.setKhachHang(khachHang);
        }

        if (request.getIdPhieuGiamGia() != null) {
            PhieuGiamGia phieuGiamGia = phieuGiamGiaRepository.findById(request.getIdPhieuGiamGia())
                    .orElseThrow(() -> new ResourceNotFoundException("Phiếu giảm giá không tồn tại với ID: " + request.getIdPhieuGiamGia()));
            hoaDon.setPhieuGiamGia(phieuGiamGia);
        }

        if (request.getPhuongThucThanhToans() != null) {
            List<ThanhToanHoaDon> thanhToans = request.getPhuongThucThanhToans().stream()
                    .map(phuongThuc -> mapPhuongThucThanhToan(phuongThuc, hoaDon)) // Sử dụng lambda để truyền `hoaDon`
                    .collect(Collectors.toList());
            thanhToans.forEach(thanhToan -> thanhToan.setHoaDon(hoaDon));
            hoaDon.setThanhToanHoaDons(thanhToans);
        }
    }

    private KhachHangResponse mapKhachHangToResponse(KhachHang khachHang) {
        if (khachHang == null) return null;

        return KhachHangResponse.builder()
                .id(khachHang.getId())
                .maKhachHang(khachHang.getMaKhachHang())
                .tenKhachHang(khachHang.getTenKhachHang())
                .soDienThoai(khachHang.getSoDienThoai())
                .email(khachHang.getEmail())
                // Thêm dòng này để lấy danh sách địa chỉ
                .build();
    }

    @Override
    public ThanhToanHoaDon mapPhuongThucThanhToan(PhuongThucThanhToan phuongThuc, HoaDon hoaDon) {
        if (phuongThuc == null) return null;

        ThanhToanHoaDon thanhToan = new ThanhToanHoaDon();
        thanhToan.setId("TT" + UUID.randomUUID().toString().replace("-", "").substring(0, 8)); // Tạo ID
        thanhToan.setHoaDon(hoaDon); // Liên kết với HoaDon
        thanhToan.setPhuongThucThanhToan(phuongThuc);
        thanhToan.setMoTa(phuongThuc.getMoTa());
        thanhToan.setTrangThai(determineTrangThai(phuongThuc.getId())); // Xác định trạng thái
        return thanhToan;
    }

    private int determineTrangThai(String phuongThucId) {
        if ("PTTT001".equals(phuongThucId)) {
            return 1; // Trạng thái 1
        } else if ("PTTT002".equals(phuongThucId) || "PTTT003".equals(phuongThucId)) {
            return 2; // Trạng thái 2
        } else {
            return 0; // Trạng thái mặc định
        }
    }

    private NhanVienResponse mapNhanVienToResponse(NhanVien nhanVien){
        if (nhanVien == null) return null;

        return NhanVienResponse.builder()
                .id(nhanVien.getId())
                .maNhanVien(nhanVien.getMaNhanVien())
                .tenNhanVien(nhanVien.getTenNhanVien())
                .build();
    }

    private PhieuGiamGiaResponse mapPhieuGiamGiaToResponse(PhieuGiamGia phieuGiamGia) {
        if (phieuGiamGia == null) return null;

        return PhieuGiamGiaResponse.builder()
                .id(phieuGiamGia.getId())
                .maPhieuGiamGia(phieuGiamGia.getMaPhieuGiamGia())
                .tenPhieuGiamGia(phieuGiamGia.getTenPhieuGiamGia())
                .giaTriGiam(phieuGiamGia.getGiaTriGiam())
                .build();
    }
}
