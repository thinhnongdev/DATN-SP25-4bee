package com.example.server.Util;

import com.example.server.entity.HoaDon;
import com.example.server.entity.HoaDonChiTiet;
import com.example.server.entity.PhieuGiamGia;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.service.GiaoHang.AddressCache;
import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.xobject.PdfFormXObject;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PDFGenerator {
    private static final String SHOP_NAME = "4BEE SHOP";
    private static final String SHOP_ADDRESS = "Số 1 Trịnh Văn Bô, Nam Từ Liêm, Hà Nội";
    private static final String SHOP_PHONE = "0123456789";
    private static final String SHOP_EMAIL = "4beeshop@gmail.com";
    private final AddressCache addressCache;

    public byte[] generateInvoicePDF(HoaDon hoaDon) {
        validateInvoiceData(hoaDon);

        try {
            String tempFile = "invoice_" + hoaDon.getId() + ".pdf";
            PdfWriter writer = new PdfWriter(tempFile);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Set up font
            InputStream fontStream = getClass().getResourceAsStream("/fonts/NotoSans-VariableFont_wdth,wght.ttf");
            if (fontStream == null) {
                throw new RuntimeException("Không tìm thấy font file");
            }
            PdfFont font = PdfFontFactory.createFont(
                    IOUtils.toByteArray(fontStream),
                    PdfEncodings.IDENTITY_H
            );
            document.setFont(font);

            // Calculate all amounts first
            InvoiceAmounts amounts = calculateInvoiceAmounts(hoaDon);

            // Add content
            addQRCode(document, hoaDon.getMaHoaDon());
            addInvoiceDetails(document, hoaDon);

            addCustomerInfo(document, hoaDon);  // 👈 Chỉnh sửa phần hiển thị địa chỉ
            addProductsTable(document, hoaDon.getHoaDonChiTiets());
            addPaymentSummary(document, hoaDon, amounts);

            document.close();
            byte[] pdfContent = Files.readAllBytes(Paths.get(tempFile));
            Files.delete(Paths.get(tempFile));
            return pdfContent;

        } catch (Exception e) {
            log.error("Error generating PDF for invoice {}: ", hoaDon.getId(), e);
            throw new RuntimeException("Lỗi khi tạo PDF hóa đơn", e);
        }
    }

    //Thêm mã QR
    private void addQRCode(Document document, String maHoaDon) {
        Table table = new Table(new float[]{2, 1}); // Bảng 2 cột: thông tin cửa hàng | mã QR
        table.setWidth(UnitValue.createPercentValue(100));

        // Cột 1: Thông tin cửa hàng
        Cell shopInfoCell = new Cell()
                .add(new Paragraph(SHOP_NAME).setFontSize(16).setBold())
                .add(new Paragraph("Địa chỉ: " + SHOP_ADDRESS))
                .add(new Paragraph("SĐT: " + SHOP_PHONE))
                .add(new Paragraph("Email: " + SHOP_EMAIL))
                .setBorder(null)
                .setTextAlignment(TextAlignment.LEFT);
        table.addCell(shopInfoCell);

        // Cột 2: Mã QR
        BarcodeQRCode qrCode = new BarcodeQRCode(maHoaDon);
        PdfFormXObject qrCodeObject = qrCode.createFormXObject(document.getPdfDocument());
        Image qrImage = new Image(qrCodeObject).setWidth(120).setHeight(120); // Kích thước lớn hơn

        Cell qrCell = new Cell()
                .add(qrImage)
                .setBorder(null)
                .setTextAlignment(TextAlignment.RIGHT);
        table.addCell(qrCell);

        document.add(table);
        document.add(new Paragraph("\n")); // Thêm khoảng cách
    }


    private void addInvoiceDetails(Document document, HoaDon hoaDon) {
        document.add(new Paragraph("HÓA ĐƠN BÁN HÀNG")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(20)
                .setBold());
        document.add(new Paragraph("Mã hóa đơn: " + hoaDon.getMaHoaDon()));
        document.add(new Paragraph("Ngày tạo: " +
                hoaDon.getNgayTao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
        document.add(new Paragraph("\n"));
    }

    private void addCustomerInfo(Document document, HoaDon hoaDon) {
        // Kiểm tra nếu người nhận là "Khách hàng lẻ" hoặc hóa đơn không có thông tin khách hàng
        if (hoaDon.getTenNguoiNhan() == null || hoaDon.getTenNguoiNhan().isEmpty() || hoaDon.getTenNguoiNhan().equals("Khách hàng lẻ")) {
            hoaDon.setTenNguoiNhan("Khách hàng lẻ");
            document.add(new Paragraph("THÔNG TIN KHÁCH HÀNG")
                    .setBold()
                    .setFontSize(14));
            Table table = new Table(new float[]{1, 4});
            table.setWidth(UnitValue.createPercentValue(100));
            table.addCell(createCell("Tên khách hàng:", true).setBorder(null).setTextAlignment(TextAlignment.LEFT).setPadding(5));
            table.addCell(createCell(hoaDon.getTenNguoiNhan(), false).setBorder(null).setTextAlignment(TextAlignment.LEFT).setWidth(UnitValue.createPercentValue(75)));

            // Nếu là hóa đơn giao hàng (loaiHoaDon = 3), hiển thị thêm địa chỉ
            String diaChiFormatted = addressCache.getFormattedDiaChi(hoaDon.getDiaChi());
            if (hoaDon.getLoaiHoaDon() == 3) {
                table.addCell(createCell("Địa chỉ giao hàng:", true).setBorder(null));
                table.addCell(createCell(diaChiFormatted != null && !diaChiFormatted.isEmpty() ? diaChiFormatted : "Chưa cung cấp", false)
                        .setBorder(null)
                        .setTextAlignment(TextAlignment.LEFT)
                        .setWidth(UnitValue.createPercentValue(75))
                        .setPadding(5));
            }


            document.add(table);
            document.add(new Paragraph("\n"));
            return;
        }

        document.add(new Paragraph("THÔNG TIN KHÁCH HÀNG")
                .setBold()
                .setFontSize(14));
        Table table = new Table(new float[]{1, 4});
        table.setWidth(UnitValue.createPercentValue(100));

        table.addCell(createCell("Tên khách hàng:", true)
                .setBorder(null)
                .setTextAlignment(TextAlignment.LEFT)
                .setPadding(5));

        table.addCell(createCell(hoaDon.getTenNguoiNhan(), false)
                .setBorder(null)
                .setTextAlignment(TextAlignment.LEFT)
                .setWidth(UnitValue.createPercentValue(75)));

        table.addCell(createCell("Số điện thoại:", true).setBorder(null));
        table.addCell(createCell(hoaDon.getSoDienThoai(), false).setBorder(null));

        // Chuyển đổi địa chỉ từ ID sang tên đầy đủ
        String diaChiFormatted = addressCache.getFormattedDiaChi(hoaDon.getDiaChi());

// Kiểm tra nếu địa chỉ không được nhận diện
        if (diaChiFormatted.contains("Không xác định")) {
            log.error("⚠ Lỗi: Địa chỉ không được nhận diện cho hóa đơn {}", hoaDon.getId());
        }

        table.addCell(createCell("Địa chỉ:", true).setBorder(null));
        table.addCell(createCell(diaChiFormatted, false)
                .setBorder(null)
                .setTextAlignment(TextAlignment.LEFT)
                .setWidth(UnitValue.createPercentValue(75))
                .setPadding(5));


        if (hoaDon.getEmailNguoiNhan() != null && !hoaDon.getEmailNguoiNhan().isEmpty()) {
            table.addCell(createCell("Email:", true).setBorder(null));
            table.addCell(createCell(hoaDon.getEmailNguoiNhan(), false).setBorder(null));
        }

        if (hoaDon.getGhiChu() != null && !hoaDon.getGhiChu().isEmpty()) {
            table.addCell(createCell("Ghi chú:", true).setBorder(null));
            table.addCell(createCell(hoaDon.getGhiChu(), false).setBorder(null));
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }



    private void addProductsTable(Document document, List<HoaDonChiTiet> chiTiets) {
        Table table = new Table(new float[]{4, 2, 2, 1, 2, 2});
        table.setWidth(UnitValue.createPercentValue(100));

        // Thêm tiêu đề bảng
        table.addHeaderCell(createHeaderCell("Sản phẩm"));
        table.addHeaderCell(createHeaderCell("Màu sắc"));
        table.addHeaderCell(createHeaderCell("Kích thước"));
        table.addHeaderCell(createHeaderCell("SL"));
        table.addHeaderCell(createHeaderCell("Đơn giá"));
        table.addHeaderCell(createHeaderCell("Thành tiền"));

        // Thêm sản phẩm
        for (HoaDonChiTiet chiTiet : chiTiets) {
            SanPhamChiTiet sanPham = chiTiet.getSanPhamChiTiet();
            BigDecimal thanhTien = sanPham.getGia().multiply(new BigDecimal(chiTiet.getSoLuong()));

            table.addCell(createCell(sanPham.getSanPham().getTenSanPham(), false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(sanPham.getMauSac() != null ? sanPham.getMauSac().getTenMau() : "Không có", false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(sanPham.getKichThuoc() != null ? sanPham.getKichThuoc().getTenKichThuoc() : "Không có", false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(String.valueOf(chiTiet.getSoLuong()), false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(formatCurrency(sanPham.getGia()), false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(formatCurrency(thanhTien), false).setTextAlignment(TextAlignment.CENTER));
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addPaymentSummary(Document document, HoaDon hoaDon, InvoiceAmounts amounts) {
        document.add(new Paragraph("THÔNG TIN THANH TOÁN")
                .setBold()
                .setFontSize(14));

        Table table = new Table(new float[]{4, 2});
        table.setWidth(UnitValue.createPercentValue(60));
        table.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

        table.addCell(createCell("Tổng tiền hàng:", true).setBorder(null));
        table.addCell(createCell(formatCurrency(amounts.getTongTienHang()), false)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null));

        if (amounts.getTienGiamGia().compareTo(BigDecimal.ZERO) > 0) {
            table.addCell(createCell("Số tiền giảm:", true).setBorder(null));
            table.addCell(createCell(formatCurrency(amounts.getTienGiamGia()), false)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(null));
        }

        if (amounts.getPhiVanChuyen().compareTo(BigDecimal.ZERO) > 0) {
            table.addCell(createCell("Phí vận chuyển:", true).setBorder(null));
            table.addCell(createCell(formatCurrency(amounts.getPhiVanChuyen()), false)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(null));
        }

        table.addCell(createCell("Tổng thanh toán:", true).setBorder(null).setBold());
        table.addCell(createCell(formatCurrency(amounts.getTongThanhToan()), false)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null)
                .setBold());

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    @Data
    @AllArgsConstructor
    private static class InvoiceAmounts {
        private BigDecimal tongTienHang;
        private BigDecimal tienGiamGia;
        private BigDecimal phiVanChuyen;
        private BigDecimal tongThanhToan;
    }

    private InvoiceAmounts calculateInvoiceAmounts(HoaDon hoaDon) {
        // Tính tổng tiền hàng
        BigDecimal tongTienHang = hoaDon.getHoaDonChiTiets().stream()
                .map(ct -> ct.getSanPhamChiTiet().getGia()
                        .multiply(new BigDecimal(ct.getSoLuong())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính tiền giảm giá
        BigDecimal tienGiamGia = BigDecimal.ZERO;
        if (hoaDon.getPhieuGiamGia() != null) {
            PhieuGiamGia phieuGiamGia = hoaDon.getPhieuGiamGia();

            if (phieuGiamGia.getGiaTriGiam() != null &&
                    phieuGiamGia.getGiaTriGiam().compareTo(BigDecimal.ZERO) > 0 &&
                    tongTienHang.compareTo(phieuGiamGia.getGiaTriToiThieu()) >= 0) {

                if (phieuGiamGia.getLoaiPhieuGiamGia() == 1) {
                    // Giảm theo phần trăm
                    tienGiamGia = tongTienHang.multiply(phieuGiamGia.getGiaTriGiam())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                    // Giới hạn số tiền giảm tối đa
                    if (phieuGiamGia.getSoTienGiamToiDa() != null &&
                            tienGiamGia.compareTo(phieuGiamGia.getSoTienGiamToiDa()) > 0) {
                        tienGiamGia = phieuGiamGia.getSoTienGiamToiDa();
                    }
                } else {
                    // Giảm theo số tiền cố định
                    tienGiamGia = phieuGiamGia.getGiaTriGiam();

                    // Đảm bảo không giảm vượt quá tổng tiền hàng
                    if (tienGiamGia.compareTo(tongTienHang) > 0) {
                        tienGiamGia = tongTienHang;
                    }
                }
            }
        }
//        Lấy phí vận chuyển
        BigDecimal phiVanChuyen = hoaDon.getPhiVanChuyen() != null ? hoaDon.getPhiVanChuyen() : BigDecimal.ZERO;

        // Tính tổng thanh toán
        BigDecimal tongThanhToan = tongTienHang.add(phiVanChuyen).subtract(tienGiamGia).max(BigDecimal.ZERO);

        return new InvoiceAmounts(tongTienHang, tienGiamGia, phiVanChuyen, tongThanhToan);
    }

    private void validateInvoiceData(HoaDon hoaDon) {
        if (hoaDon == null) {
            throw new IllegalArgumentException("Hóa đơn không thể null");
        }

        if (hoaDon.getHoaDonChiTiets() == null || hoaDon.getHoaDonChiTiets().isEmpty()) {
            throw new IllegalArgumentException("Hóa đơn phải có ít nhất một sản phẩm");
        }

        for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
            if (chiTiet.getSoLuong() == null || chiTiet.getSoLuong() <= 0) {
                throw new IllegalArgumentException("Số lượng sản phẩm không hợp lệ");
            }
            if (chiTiet.getSanPhamChiTiet() == null ||
                    chiTiet.getSanPhamChiTiet().getGia() == null ||
                    chiTiet.getSanPhamChiTiet().getGia().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Thông tin giá sản phẩm không hợp lệ");
            }
        }
    }

    private Cell createHeaderCell(String content) {
        return new Cell()
                .add(new Paragraph(content))
                .setBold()
                .setPadding(5)
                .setTextAlignment(TextAlignment.CENTER)
                .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY);
    }

    private Cell createCell(String content, boolean isHeader) {
        Cell cell = new Cell().add(new Paragraph(content));
        if (isHeader) {
            cell.setBold(); // Đậm chữ cho tiêu đề
        }
        return cell
                .setPadding(5)
                .setTextAlignment(TextAlignment.LEFT);
    }


    private String formatCurrency(BigDecimal amount) {
        DecimalFormat formatter = new DecimalFormat("#,###");
        return formatter.format(amount) + " VNĐ";
    }
}

