package com.example.server.service.Client;

import com.example.server.dto.Client.request.SanPhamChiTietClientRequest;
import com.example.server.dto.Client.request.ThongTinGiaoHangClientRequest;
import com.example.server.dto.Client.response.ThanhToanHoaDonClientResponse;
import com.example.server.entity.*;
import com.example.server.repository.HoaDon.LichSuHoaDonRepository;
import com.example.server.repository.HoaDon.PhuongThucThanhToanRepository;
import com.example.server.repository.HoaDon.ThanhToanHoaDonRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.service.HoaDon.impl.LichSuHoaDonService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ThanhToanClientService {
    @Autowired
    private LichSuHoaDonRepository lichSuHoaDonRepository;
    @Autowired
    ThanhToanHoaDonRepository thanhToanHoaDonRepository;
    @Autowired
    PhuongThucThanhToanRepository phuongThucThanhToanHoaDonRepository;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private LichSuHoaDonService lichSuHoaDonService;

    public List<ThanhToanHoaDonClientResponse> findThanhToanHoaDon(String idHoaDon) {
        List<ThanhToanHoaDonClientResponse> thanhToanHoaDons = thanhToanHoaDonRepository.findByHoaDonIdForClient(idHoaDon);

        return thanhToanHoaDons;
    }

    public ThanhToanHoaDon createThanhToanHoaDon(String phuongThucThanhToan, HoaDon hoaDon, BigDecimal tienThanhToan, ThongTinGiaoHangClientRequest thongTinGiaoHangClientRequest) {
        ThanhToanHoaDon thanhToanHoaDon = new ThanhToanHoaDon();
        //thanhToanHoaDon.setId(UUID.randomUUID().toString());
        thanhToanHoaDon.setPhuongThucThanhToan(phuongThucThanhToanHoaDonRepository.findByMaPhuongThucThanhToan(phuongThucThanhToan).orElseThrow());
        thanhToanHoaDon.setHoaDon(hoaDon);
        thanhToanHoaDon.setSoTien(tienThanhToan);
        thanhToanHoaDon.setTrangThai(phuongThucThanhToan.equalsIgnoreCase("COD") ? 3 : 1); //1 đã thanh toán, 3 là trả sau
        thanhToanHoaDon.setNgayTao(LocalDateTime.now());

        // Lịch sử nè
        LichSuHoaDon lichSuHoaDon = new LichSuHoaDon();
        lichSuHoaDon.setId("LS" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        lichSuHoaDon.setHoaDon(hoaDon);
        lichSuHoaDon.setKhachHang(khachHangRepository.findById(thongTinGiaoHangClientRequest.getIdKhachHang()).orElse(null));
        lichSuHoaDon.setNgayTao(LocalDateTime.now());

        //Nội dung mô tả chi tiết hơn
        String trangThaiThanhToan = phuongThucThanhToan.equalsIgnoreCase("COD") ? "trả sau (COD)" : "đã thanh toán";
        String tenPhuongThuc = phuongThucThanhToanHoaDonRepository.findByMaPhuongThucThanhToan(phuongThucThanhToan)
                .map(PhuongThucThanhToan::getTenPhuongThucThanhToan)
                .orElse(phuongThucThanhToan);

        lichSuHoaDon.setHanhDong("Khách hàng thanh toán đơn hàng ");
        lichSuHoaDon.setMoTa("Khách hàng " + thongTinGiaoHangClientRequest.getHoTen() +
                " thanh toán " + String.format("%,.0f", tienThanhToan) + " đ" +
                " bằng " + tenPhuongThuc + " (" + trangThaiThanhToan + ")");
        lichSuHoaDon.setTrangThai(1);
        lichSuHoaDonRepository.save(lichSuHoaDon);
        return thanhToanHoaDonRepository.save(thanhToanHoaDon);
    }

    @Async("emailTaskExecutor")
    public void sendOrderConfirmationEmail(ThongTinGiaoHangClientRequest khachHang, HoaDon hoaDon, BigDecimal tienThanhToan, List<SanPhamChiTietClientRequest> sanPhamChiTietClientRequestList, PhieuGiamGia phieuGiamGia, BigDecimal tongTienHang) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(khachHang.getEmail());
            helper.setSubject("Thông tin đơn đặt hàng #" + hoaDon.getMaHoaDon());

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                    .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
            String ngayDatHangFormatted = LocalDateTime.now().atZone(ZoneId.of("Asia/Ho_Chi_Minh")).format(formatter);

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                        <div style="background: linear-gradient(90deg, #283E51, #D2222D); color: #fff; padding: 20px; text-align: center;">
                            <h2 style="margin: 0;">Thông tin đơn hàng tại 4BEE</h2>
                        </div>
                        <div style="padding: 10px; background: #fff;">
                            <h3 style="color: #333; font-size: 18px;">Cảm ơn quý khách <strong>{{tenKhachHang}}</strong> đã đặt hàng tại 4BEE</h3>
                            <p style="font-size: 16px; color: #555;">4BEE rất vui mừng thông báo rằng đơn hàng của quý khách đã được tiếp nhận và đang trong quá trình xử lý. Nhân viên 4BEE sẽ gọi điện cho quý khách để xác nhận trong thời gian sớm nhất.</p>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">

                        <div style="padding: 10px;">
                            <h4 style="color: #333; font-size: 18px;">Thông tin khách hàng</h4>
                            <p><strong>Tên khách hàng:</strong> {{tenKhachHang}}</p>
                            <p><strong>Địa chỉ email:</strong> {{email}}</p>
                            <p><strong>Điện thoại:</strong> {{soDienThoai}}</p>
                            <p><strong>Địa chỉ:</strong> {{diaChi}}</p>
                            <p><strong>Khách hàng ghi chú:</strong> {{ghiChu}}</p>
                        </div>

                        <h4 style="padding: 10px; background: #f4f4f4; font-size: 18px;">Nội dung đặt hàng</h4>
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;">
                            <thead>
                                <tr style="background-color: #FFD700; color: #333;">
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">STT</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mã kho</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Sản phẩm</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Màu sắc</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Kích thước</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Đơn giá</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Số lượng</th>
                                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{chiTietSanPham}}
                            </tbody>
                        </table>

                        <h5 style="padding: 10px; text-align: right; font-size: 20px;">Giảm giá: <strong>{{giamGia}} đ</strong></h5>
                        <h5 style="padding: 10px; text-align: right; font-size: 20px;">Phí vận chuyển: <strong>{{phiShip}} đ</strong></h5>
                        <h3 style="padding: 10px; color: red; text-align: right; font-size: 20px;">Thanh toán: <strong>{{tongTien}} đ</strong></h3>

                        <div style="background: #f1f1f1; padding: 10px; text-align: center;">
                            <p style="font-size: 14px; color: #6c757d;">Trân trọng,<br><strong>4BEE TEAM</strong></p>
                        </div>
                    </div>
                    """;

            BigDecimal giamGia = BigDecimal.ZERO;
            BigDecimal tongTienSanPham = BigDecimal.ZERO;
            for (SanPhamChiTietClientRequest chiTiet : sanPhamChiTietClientRequestList) {
                BigDecimal tienSanPham = chiTiet.getGia().multiply(BigDecimal.valueOf(chiTiet.getQuantity()));
                tongTienSanPham = tongTienSanPham.add(tienSanPham);
            }
            if (tongTienSanPham.compareTo(phieuGiamGia.getGiaTriToiThieu()) == 0 || tongTienSanPham.compareTo(phieuGiamGia.getGiaTriToiThieu()) > 0) {//kiểm tra giá tổng tiền có nhỏ hơn giá trị giảm tối thiếu không
                if (phieuGiamGia.getLoaiPhieuGiamGia().equals(1)) {//nếu loại giảm giá là %
                    BigDecimal giaTriGiamTheoPhanTram = tongTienSanPham.divide(BigDecimal.valueOf(100)).multiply(phieuGiamGia.getGiaTriGiam());
                    if (giaTriGiamTheoPhanTram.compareTo(phieuGiamGia.getSoTienGiamToiDa()) < 0) {//nếu giá trị giảm theo phần trăm nhỏ hơn giá trị giảm tối đa
                        giamGia = giaTriGiamTheoPhanTram;
                    } else {
                        giamGia = phieuGiamGia.getSoTienGiamToiDa();
                    }
                } else {
                    giamGia = phieuGiamGia.getGiaTriGiam();
                }
            }
            System.out.println("số tiền được giảm" + giamGia);
            htmlContent = htmlContent
                    .replace("{{tenKhachHang}}", khachHang.getHoTen())
                    .replace("{{email}}", khachHang.getEmail())
                    .replace("{{soDienThoai}}", khachHang.getSoDienThoai())
                    .replace("{{diaChi}}", khachHang.getDiaChiCuThe())
                    .replace("{{ghiChu}}", khachHang.getGhiChu() != null ? khachHang.getGhiChu() : "Không có")
                    .replace("{{giamGia}}", String.format("%,.0f", giamGia))
                    .replace("{{phiShip}}", String.format("%,.0f", (tienThanhToan.subtract(tongTienHang))))
                    .replace("{{tongTien}}", String.format("%,.0f", tienThanhToan));
            String chiTietSanPham = "";
            int stt = 1;

            for (SanPhamChiTietClientRequest chiTiet : sanPhamChiTietClientRequestList) {
                chiTietSanPham += String.format(
                        "<tr>" +
                                "<td style='text-align: center; padding: 10px; border: 1px solid #ddd;'>%d</td>" +
                                "<td style='padding: 10px; border: 1px solid #ddd;'>%s</td>" +
                                "<td style='padding: 10px; border: 1px solid #ddd; color: #007bff;'>%s</td>"
                                +
                                "<td style='padding: 10px; border: 1px solid #ddd; color: #007bff;'>%s</td>"
                                +
                                "<td style='padding: 10px; border: 1px solid #ddd; color: #007bff;'>%s</td>" +
                                "<td style='text-align: center; padding: 10px; border: 1px solid #ddd;'>%,.0f đ</td>" +
                                "<td style='text-align: center; padding: 10px; border: 1px solid #ddd;'>%d</td>" +
                                "<td style='text-align: center; padding: 10px; border: 1px solid #ddd; font-weight: bold; color: red;'>%,.0f đ</td>" +
                                "</tr>",
                        stt++, chiTiet.getMaSanPhamChiTiet(), chiTiet.getSanPham().getTenSanPham(), chiTiet.getMauSac().getTenMau(), chiTiet.getKichThuoc().getTenKichThuoc(),
                        chiTiet.getGia(), chiTiet.getQuantity(),
                        chiTiet.getGia().multiply(BigDecimal.valueOf(chiTiet.getQuantity()))
                );
            }
            htmlContent = htmlContent.replace("{{chiTietSanPham}}", chiTietSanPham);

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            //logger.info("Email xác nhận đơn hàng đã gửi cho {}", khachHang.getEmail());

        } catch (MailSendException e) {
            log.error("Không thể gửi email đến {}. Kiểm tra địa chỉ email hoặc cấu hình SMTP. Chi tiết: {}", khachHang.getEmail(), e.getMessage());
        } catch (MessagingException e) {
            log.error("Lỗi tạo email đến {}: {}", khachHang.getEmail(), e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi không xác định khi gửi email xác nhận đơn hàng: {}", e.getMessage());
        }

    }
}
