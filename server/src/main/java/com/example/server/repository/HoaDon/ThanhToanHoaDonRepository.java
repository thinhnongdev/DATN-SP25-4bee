package com.example.server.repository.HoaDon;

import com.example.server.dto.Client.response.ThanhToanHoaDonClientResponse;
import com.example.server.entity.HoaDon;
import com.example.server.entity.PhuongThucThanhToan;
import com.example.server.entity.ThanhToanHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThanhToanHoaDonRepository extends JpaRepository<ThanhToanHoaDon, String> {
    List<ThanhToanHoaDon> findByHoaDonId(String hoaDonId);
    @Query("select new com.example.server.dto.Client.response.ThanhToanHoaDonClientResponse(" +
            "h.id,h.moTa,h.ngayTao,h.ngaySua,h.trangThai," +
            "h.soTien,h.phuongThucThanhToan)" +
            " from ThanhToanHoaDon h where h.hoaDon.loaiHoaDon=1 and  h.hoaDon.trangThai <> 10  and h.hoaDon.id=:idHoaDon") //bỏ hóa đơn có trang thái là pendding
    List<ThanhToanHoaDonClientResponse> findByHoaDonIdForClient(String idHoaDon);
    // Thêm vào ThanhToanHoaDonRepository.java
    Optional<ThanhToanHoaDon> findByHoaDonAndPhuongThucThanhToan(HoaDon hoaDon, PhuongThucThanhToan phuongThucThanhToan);
    List<ThanhToanHoaDon> findByHoaDonAndPhuongThucThanhToanNot(HoaDon hoaDon, PhuongThucThanhToan phuongThucThanhToan);
}

