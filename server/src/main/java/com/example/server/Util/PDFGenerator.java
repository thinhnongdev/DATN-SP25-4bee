package com.example.server.Util;

import com.example.server.constant.PaymentConstant;
import com.example.server.entity.*;
import com.example.server.service.GiaoHang.AddressCache;
import com.itextpdf.barcodes.BarcodeQRCode;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
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
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class PDFGenerator {
    private static final String SHOP_NAME = "4BEE SHOP";
    private static final String SHOP_ADDRESS = "Số 1,Hẻm 132/52/3 Đường Cầu Diễn, Tổ Dân Phố Nguyên Xá 22";
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
        document.add(new Paragraph("THÔNG TIN KHÁCH HÀNG")
                .setBold()
                .setFontSize(14));
        Table table = new Table(new float[]{1, 4});
        table.setWidth(UnitValue.createPercentValue(100));

        // Xác định tên khách hàng hiển thị
        String tenHienThi = "Khách hàng lẻ";
        boolean isUnnamedCustomer = false;

        // Nếu khách hàng lẻ đã nhập tên người nhận
        if (hoaDon.getTenNguoiNhan() != null && !hoaDon.getTenNguoiNhan().trim().isEmpty()
                && !hoaDon.getTenNguoiNhan().equalsIgnoreCase("Khách hàng lẻ")) {
            tenHienThi = hoaDon.getTenNguoiNhan().trim();
            isUnnamedCustomer = false;
        } else if (hoaDon.getKhachHang() != null && hoaDon.getKhachHang().getTenKhachHang() != null) {
            // Khách hàng có tài khoản
            tenHienThi = hoaDon.getKhachHang().getTenKhachHang();
            isUnnamedCustomer = false;
        } else {
            // Trường hợp không có tên người nhận
            isUnnamedCustomer = true;
        }

        table.addCell(createCell("Tên khách hàng:", true).setBorder(null).setTextAlignment(TextAlignment.LEFT).setPadding(2));
        table.addCell(createCell(tenHienThi, false).setBorder(null).setTextAlignment(TextAlignment.LEFT).setWidth(UnitValue.createPercentValue(75)));

        // Thêm số điện thoại nếu có
        if (hoaDon.getSoDienThoai() != null && !hoaDon.getSoDienThoai().trim().isEmpty()) {
            table.addCell(createCell("Số điện thoại:", true).setBorder(null));
            table.addCell(createCell(hoaDon.getSoDienThoai().trim(), false).setBorder(null));
        }

        // Xử lý hiển thị địa chỉ
        if (hoaDon.getLoaiHoaDon() == 3) { // Loại hóa đơn giao hàng
            String diaChiFormatted = "";
            if (hoaDon.getDiaChi() != null && !hoaDon.getDiaChi().trim().isEmpty()) {
                diaChiFormatted = addressCache.getFormattedDiaChi(hoaDon.getDiaChi());
            }

            if (!diaChiFormatted.isEmpty()) {
                table.addCell(createCell("Địa chỉ giao hàng:", true).setBorder(null));
                table.addCell(createCell(diaChiFormatted, false)
                        .setBorder(null)
                        .setTextAlignment(TextAlignment.LEFT)
                        .setWidth(UnitValue.createPercentValue(75))
                        .setPadding(2));
            }
        }

        // Thêm email nếu có
        if (hoaDon.getEmailNguoiNhan() != null && !hoaDon.getEmailNguoiNhan().trim().isEmpty()) {
            table.addCell(createCell("Email:", true).setBorder(null));
            table.addCell(createCell(hoaDon.getEmailNguoiNhan().trim(), false).setBorder(null));
        }

        // Thêm ghi chú nếu có
        if (hoaDon.getGhiChu() != null && !hoaDon.getGhiChu().trim().isEmpty()) {
            table.addCell(createCell("Ghi chú:", true).setBorder(null));
            table.addCell(createCell(hoaDon.getGhiChu().trim(), false).setBorder(null));
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }
    private void addProductsTable(Document document, List<HoaDonChiTiet> chiTiets) {
        Table table = new Table(new float[]{4, 2, 2, 1, 1, 2, 2, 2});
        table.setWidth(UnitValue.createPercentValue(100));

        // Thêm tiêu đề bảng
        table.addHeaderCell(createHeaderCell("Sản phẩm"));
        table.addHeaderCell(createHeaderCell("Màu sắc"));
        table.addHeaderCell(createHeaderCell("Kích thước"));
        table.addHeaderCell(createHeaderCell("Chất liệu"));
        table.addHeaderCell(createHeaderCell("Thương hiệu"));
        table.addHeaderCell(createHeaderCell("SL"));
        table.addHeaderCell(createHeaderCell("Đơn giá"));
        table.addHeaderCell(createHeaderCell("Thành tiền"));

        // Thêm sản phẩm
        for (HoaDonChiTiet chiTiet : chiTiets) {
            SanPhamChiTiet sanPham = chiTiet.getSanPhamChiTiet();

            // Sử dụng giá tại thời điểm thêm vào đơn hàng nếu có
            BigDecimal donGia = chiTiet.getGiaTaiThoiDiemThem() != null ?
                    chiTiet.getGiaTaiThoiDiemThem() :
                    sanPham.getGia();

            BigDecimal thanhTien = donGia.multiply(new BigDecimal(chiTiet.getSoLuong()));

            table.addCell(createCell(sanPham.getSanPham().getTenSanPham(), false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(sanPham.getMauSac() != null ? sanPham.getMauSac().getTenMau() : "Không có", false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(sanPham.getKichThuoc() != null ? sanPham.getKichThuoc().getTenKichThuoc() : "Không có", false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(sanPham.getChatLieu() != null ? sanPham.getChatLieu().getTenChatLieu() : "Không có", false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(sanPham.getThuongHieu() != null ? sanPham.getThuongHieu().getTenThuongHieu() : "Không có", false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(String.valueOf(chiTiet.getSoLuong()), false).setTextAlignment(TextAlignment.CENTER));
            table.addCell(createCell(formatCurrency(donGia), false).setTextAlignment(TextAlignment.CENTER));
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
                .map(ct -> {
                    // Sử dụng giá tại thời điểm thêm nếu có, nếu không thì dùng giá của sản phẩm
                    BigDecimal gia = ct.getGiaTaiThoiDiemThem() != null ?
                            ct.getGiaTaiThoiDiemThem() : ct.getSanPhamChiTiet().getGia();
                    return gia.multiply(new BigDecimal(ct.getSoLuong()));
                })
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
                .setPadding(2)
                .setTextAlignment(TextAlignment.CENTER)
                .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY);
    }

    private Cell createCell(String content, boolean isHeader) {
        Cell cell = new Cell().add(new Paragraph(content));
        if (isHeader) {
            cell.setBold(); // Đậm chữ cho tiêu đề
        }
        return cell
                .setPadding(2)
                .setTextAlignment(TextAlignment.LEFT);
    }
    //
    public byte[] generateDeliveryInvoicePDF(HoaDon hoaDon) {
        validateInvoiceData(hoaDon);

        try {
            String tempFile = "delivery_invoice_" + hoaDon.getId() + ".pdf";
            PdfWriter writer = new PdfWriter(tempFile);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.setMargins(5, 5, 5, 5); // Cực kỳ mỏng

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

            // Calculate all amounts first (reuse same logic as invoice)
            InvoiceAmounts amounts = calculateInvoiceAmounts(hoaDon);

            // Header with logo and barcode
            addDeliveryHeader(document, hoaDon, pdf);

            // Sender and receiver information
            addDeliverySenderReceiverInfo(document, hoaDon);

            // Order information
            addDeliveryOrderInfo(document, hoaDon);

            // Product simplified list - without table
            addSimplifiedProductList(document, hoaDon);

            // Payment details - truyền thêm hoaDon để xử lý chi tiết thanh toán
            addDeliveryPaymentSummary(document, hoaDon, amounts);

            // Signature area
            addDeliverySignatureArea(document);

            document.close();
            byte[] pdfContent = Files.readAllBytes(Paths.get(tempFile));
            Files.delete(Paths.get(tempFile));
            return pdfContent;

        } catch (Exception e) {
            log.error("Error generating delivery PDF for invoice {}: ", hoaDon.getId(), e);
            throw new RuntimeException("Lỗi khi tạo PDF phiếu giao hàng", e);
        }
    }

    private void addDeliveryHeader(Document document, HoaDon hoaDon, PdfDocument pdf) {
        Table header = new Table(2);
        header.setWidth(UnitValue.createPercentValue(100));
        header.setBackgroundColor(ColorConstants.WHITE);

        // Left column - Logo and shop name
        Cell logoCell = new Cell();
        try {
            InputStream logoStream = getClass().getResourceAsStream("/images/4bee-logo4.png");
            if (logoStream != null) {
                byte[] logoBytes = IOUtils.toByteArray(logoStream);
                com.itextpdf.io.image.ImageData imageData = com.itextpdf.io.image.ImageDataFactory.create(logoBytes);
                Image logoImage = new Image(imageData);
                logoImage.setWidth(60);
                logoCell.add(logoImage);
            } else {
                logoCell.add(new Paragraph(SHOP_NAME).setBold());
            }
        } catch (Exception e) {
            logoCell.add(new Paragraph(SHOP_NAME).setBold());
        }

        logoCell.add(new Paragraph("PHIẾU GIAO HÀNG").setBold().setFontSize(12));
        logoCell.setBorder(null);
        logoCell.setPadding(2);
        header.addCell(logoCell);

        // Right column - Barcode
        Cell barcodeCell = new Cell();
        try {
            // Xử lý mã hóa đơn null
            String maHoaDon = hoaDon.getMaHoaDon();
            if (maHoaDon == null || maHoaDon.trim().isEmpty()) {
                maHoaDon = "NO_ID_" + hoaDon.getId();
            }

            com.itextpdf.barcodes.Barcode128 barcode = new com.itextpdf.barcodes.Barcode128(pdf);
            barcode.setCode(maHoaDon);
            barcode.setCodeType(com.itextpdf.barcodes.Barcode128.CODE128);
            Image barcodeImage = new Image(barcode.createFormXObject(pdf));
            barcodeImage.setWidth(150);
            barcodeImage.setHeight(30);
            barcodeCell.add(barcodeImage);
        } catch (Exception e) {
            String maHoaDon = hoaDon.getMaHoaDon() != null ? hoaDon.getMaHoaDon() : "Không có mã";
            barcodeCell.add(new Paragraph(maHoaDon));
        }

        barcodeCell.setBorder(null);
        barcodeCell.setPadding(2);
        barcodeCell.setTextAlignment(TextAlignment.RIGHT);
        header.addCell(barcodeCell);

        document.add(header);
        document.add(new Paragraph("---------------------------------------------------")
                .setFontSize(7)
                .setMarginTop(2)
                .setMarginBottom(2)
                .setTextAlignment(TextAlignment.CENTER));
    }

    private void addDeliverySenderReceiverInfo(Document document, HoaDon hoaDon) {
        Table addressTable = new Table(2);
        addressTable.setWidth(UnitValue.createPercentValue(100));

        // Sender info
        Cell senderCell = new Cell();
        senderCell.add(new Paragraph("NGƯỜI GỬI:").setBold().setFontSize(10));
        senderCell.add(new Paragraph(SHOP_NAME).setFontSize(10));
        senderCell.add(new Paragraph(SHOP_ADDRESS).setFontSize(9));
        senderCell.add(new Paragraph("SĐT: " + SHOP_PHONE).setFontSize(9));
        senderCell.setBorder(null);
        senderCell.setPadding(2);
        addressTable.addCell(senderCell);

        // Receiver info
        Cell receiverCell = new Cell();
        receiverCell.add(new Paragraph("NGƯỜI NHẬN:").setBold().setFontSize(10));

        // Xử lý thông tin người nhận
        String tenNguoiNhan = "Khách hàng lẻ";
        if (hoaDon.getTenNguoiNhan() != null && !hoaDon.getTenNguoiNhan().trim().isEmpty()
                && !hoaDon.getTenNguoiNhan().equalsIgnoreCase("Khách hàng lẻ")) {
            tenNguoiNhan = hoaDon.getTenNguoiNhan().trim();
        }
        receiverCell.add(new Paragraph(tenNguoiNhan).setFontSize(10));

        // Xử lý số điện thoại
        if (hoaDon.getSoDienThoai() != null && !hoaDon.getSoDienThoai().trim().isEmpty()) {
            receiverCell.add(new Paragraph("SĐT: " + hoaDon.getSoDienThoai().trim()).setFontSize(9));
        }

        // Địa chỉ đầy đủ
        if (hoaDon.getDiaChi() != null && !hoaDon.getDiaChi().trim().isEmpty()) {
            String diaChiFormatted = addressCache.getFormattedDiaChi(hoaDon.getDiaChi());
            receiverCell.add(new Paragraph(diaChiFormatted).setFontSize(9));
        }

        receiverCell.setBorder(null);
        receiverCell.setPadding(2);
        addressTable.addCell(receiverCell);

        document.add(addressTable);
    }

    private void addDeliveryOrderInfo(Document document, HoaDon hoaDon) {
        Table infoTable = new Table(2);
        infoTable.setWidth(UnitValue.createPercentValue(100));

        // Order information
        Cell orderInfoCell = new Cell();

        // Xử lý mã hóa đơn null
        String maHoaDon = "Không có mã";
        if (hoaDon.getMaHoaDon() != null && !hoaDon.getMaHoaDon().trim().isEmpty()) {
            maHoaDon = hoaDon.getMaHoaDon();
        }
        orderInfoCell.add(new Paragraph("Mã đơn hàng: " + maHoaDon).setFontSize(10));

        // Xử lý ngày tạo null
        if (hoaDon.getNgayTao() != null) {
            orderInfoCell.add(new Paragraph("Ngày đặt hàng: " +
                    hoaDon.getNgayTao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).setFontSize(9));
        }

        // Xử lý ghi chú nếu có
        if (hoaDon.getGhiChu() != null && !hoaDon.getGhiChu().trim().isEmpty()) {
            orderInfoCell.add(new Paragraph("Ghi chú: " + hoaDon.getGhiChu()).setFontSize(9));
        }

        orderInfoCell.setBorder(null);
        orderInfoCell.setPadding(2);
        infoTable.addCell(orderInfoCell);

        // COD Label if applicable
        Cell paymentCell = new Cell();

        // Tính chi tiết thanh toán để xác định phương thức hiển thị chính xác
        PaymentDetails details = calculatePaymentDetails(hoaDon);
        boolean isCOD = isPaymentCOD(hoaDon);

        // Quyết định loại thông báo dựa trên tình trạng thanh toán
        if (isCOD) {
            // Hiển thị số tiền cần thu nếu là COD
            paymentCell.add(new Paragraph("THANH TOÁN KHI NHẬN HÀNG")
                    .setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setBackgroundColor(ColorConstants.ORANGE)
                    .setFontSize(10)
                    .setPadding(2)
                    .setTextAlignment(TextAlignment.CENTER));

            // Thêm thông tin số tiền cần thu
            paymentCell.add(new Paragraph(formatCurrency(details.getAmountDue()))
                    .setBold()
                    .setFontSize(10)
                    .setPadding(2)
                    .setTextAlignment(TextAlignment.CENTER));
        } else if (details.isFullyPaid()) {
            // Nếu đã thanh toán đủ
            paymentCell.add(new Paragraph("ĐÃ THANH TOÁN")
                    .setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setBackgroundColor(ColorConstants.GREEN)
                    .setFontSize(10)
                    .setPadding(2)
                    .setTextAlignment(TextAlignment.CENTER));
        } else {
            // Đã thanh toán một phần nhưng không phải COD
            paymentCell.add(new Paragraph("THANH TOÁN MỘT PHẦN")
                    .setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setBackgroundColor(ColorConstants.BLUE)
                    .setFontSize(10)
                    .setPadding(2)
                    .setTextAlignment(TextAlignment.CENTER));

            // Hiển thị số tiền đã thanh toán / tổng tiền
            String paidInfo = formatCurrency(details.getAmountPaid()) + " / " +
                    formatCurrency(details.getTotalInvoiceAmount());
            paymentCell.add(new Paragraph(paidInfo)
                    .setFontSize(9)
                    .setPadding(2)
                    .setTextAlignment(TextAlignment.CENTER));
        }

        paymentCell.setBorder(null);
        paymentCell.setPadding(2);
        paymentCell.setTextAlignment(TextAlignment.RIGHT);
        infoTable.addCell(paymentCell);

        document.add(infoTable);
        document.add(new Paragraph("---------------------------------------------------")
                .setFontSize(7)
                .setMarginTop(2)
                .setMarginBottom(2)
                .setTextAlignment(TextAlignment.CENTER));
    }

    private void addSimplifiedProductList(Document document, HoaDon hoaDon) {
        document.add(new Paragraph("HÀNG HÓA")
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10)
                .setMarginTop(0)
                .setMarginBottom(2));

        // Bo viền trên
        document.add(new Paragraph("---------------------------------------------------")
                .setFontSize(7)
                .setMarginTop(2)
                .setMarginBottom(2)
                .setTextAlignment(TextAlignment.CENTER));

        for (HoaDonChiTiet chiTiet : hoaDon.getHoaDonChiTiets()) {
            SanPhamChiTiet spct = chiTiet.getSanPhamChiTiet();

            // Lấy thông tin sản phẩm
            String tenSanPham = (spct.getSanPham() != null && spct.getSanPham().getTenSanPham() != null)
                    ? spct.getSanPham().getTenSanPham()
                    : "Sản phẩm không xác định";

            // Sử dụng giá tại thời điểm thêm nếu có
            BigDecimal gia = chiTiet.getGiaTaiThoiDiemThem() != null ?
                    chiTiet.getGiaTaiThoiDiemThem() : spct.getGia();

            String soLuongVaGia = "(" + chiTiet.getSoLuong() + " x " + formatCurrency(gia) + ")";

            StringBuilder attributes = new StringBuilder();
            if (spct.getMauSac() != null && spct.getMauSac().getTenMau() != null) {
                attributes.append("Màu: ").append(spct.getMauSac().getTenMau());
            }
            if (spct.getKichThuoc() != null && spct.getKichThuoc().getTenKichThuoc() != null) {
                if (attributes.length() > 0) attributes.append(" | ");
                attributes.append("Kích thước: ").append(spct.getKichThuoc().getTenKichThuoc());
            }

            // Tạo paragraph trên 1 dòng
            Paragraph productLine = new Paragraph()
                    .setFontSize(8.5f) // Thay vì 9
                    .setMarginTop(0)
                    .setMarginBottom(0)
                    .setPadding(0)
                    .add(new com.itextpdf.layout.element.Text(tenSanPham + " ").setBold().setFontSize(10))
                    .add(new com.itextpdf.layout.element.Text(soLuongVaGia + " ").setFontSize(9));

            if (attributes.length() > 0) {
                productLine.add(new com.itextpdf.layout.element.Text("| " + attributes.toString()).setFontSize(9));
            }

            productLine.setTextAlignment(TextAlignment.LEFT);
            document.add(productLine);
        }

        // Bo viền dưới
        document.add(new Paragraph("- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER));
    }


    private void addDeliveryPaymentSummary(Document document, HoaDon hoaDon, InvoiceAmounts amounts) {
        document.add(new Paragraph("THÔNG TIN THANH TOÁN").setBold()
                .setFontSize(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setPaddingTop(3));

        // Tính toán chi tiết về tình trạng thanh toán
        PaymentDetails paymentDetails = calculatePaymentDetails(hoaDon);

        Table summaryTable = new Table(2);
        summaryTable.setWidth(UnitValue.createPercentValue(60));
        summaryTable.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

        // Luôn hiển thị tổng giá trị đơn hàng trước
        summaryTable.addCell(createCell("Tổng giá trị đơn hàng:", true)
                .setBorder(null));
        summaryTable.addCell(createCell(formatCurrency(paymentDetails.getTotalInvoiceAmount()), false)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null));

        // Hiển thị chi tiết phân tách nếu được yêu cầu (uncomment nếu cần)
    /*
    summaryTable.addCell(createCell("Tổng tiền hàng:", true)
            .setBorder(null));
    summaryTable.addCell(createCell(formatCurrency(amounts.getTongTienHang()), false)
            .setTextAlignment(TextAlignment.RIGHT)
            .setBorder(null));

    if (amounts.getTienGiamGia().compareTo(BigDecimal.ZERO) > 0) {
        summaryTable.addCell(createCell("Số tiền giảm:", true)
                .setBorder(null));
        summaryTable.addCell(createCell("-" + formatCurrency(amounts.getTienGiamGia()), false)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null));
    }

    if (amounts.getPhiVanChuyen().compareTo(BigDecimal.ZERO) > 0) {
        summaryTable.addCell(createCell("Phí vận chuyển:", true)
                .setBorder(null));
        summaryTable.addCell(createCell(formatCurrency(amounts.getPhiVanChuyen()), false)
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null));
    }
    */

        // Hiển thị đã thanh toán trước nếu có
        if (paymentDetails.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            summaryTable.addCell(createCell("Đã thanh toán:", true)
                    .setBorder(null));
            summaryTable.addCell(createCell(formatCurrency(paymentDetails.getAmountPaid()), false)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(null));
        }

        // Hiển thị hoàn tiền nếu có
        if (paymentDetails.hasRefund()) {
            summaryTable.addCell(createCell("Đã hoàn tiền:", true)
                    .setBorder(null));
            summaryTable.addCell(createCell(formatCurrency(paymentDetails.getAmountRefunded()), false)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(null));
        }

        // Hiển thị số tiền cần thu nếu có
        if (isPaymentCOD(hoaDon) && paymentDetails.getAmountDue().compareTo(BigDecimal.ZERO) > 0) {
            summaryTable.addCell(createCell("Tiền thu người nhận:", true)
                    .setBorder(null)
                    .setBold());
            summaryTable.addCell(createCell(formatCurrency(paymentDetails.getAmountDue()), false)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(null)
                    .setBold());

            // Thêm chú thích nhỏ
            Cell noteCell = new Cell(1, 2)
                    .add(new Paragraph("(Đã bao gồm phí vận chuyển cũng như giảm giá)")
                            .setFontSize(7)
                            .setItalic()
                            .setTextAlignment(TextAlignment.RIGHT))
                    .setBorder(null)
                    .setPaddingTop(0)
                    .setPaddingBottom(2);
            summaryTable.addCell(noteCell);
        }

        document.add(summaryTable);
    }

    private void addDeliverySignatureArea(Document document) {
        document.add(new Paragraph("---------------------------------------------------")
                .setFontSize(7)
                .setMarginTop(2)
                .setMarginBottom(2)
                .setTextAlignment(TextAlignment.CENTER));

        Table signatureTable = new Table(2);
        signatureTable.setWidth(UnitValue.createPercentValue(100));

        Cell shopSignCell = new Cell();
        shopSignCell.add(new Paragraph("Chữ ký người gửi").setFontSize(9).setTextAlignment(TextAlignment.CENTER));
        shopSignCell.add(new Paragraph("\n\n").setFontSize(9));
        shopSignCell.setBorder(null);
        shopSignCell.setPadding(2);
        signatureTable.addCell(shopSignCell);

        Cell customerSignCell = new Cell();
        customerSignCell.add(new Paragraph("Chữ ký người nhận").setFontSize(9).setTextAlignment(TextAlignment.CENTER));
        customerSignCell.add(new Paragraph("(Xác nhận hàng nguyên vẹn, không bóc mở)").setFontSize(8).setTextAlignment(TextAlignment.CENTER));
        customerSignCell.add(new Paragraph("\n\n").setFontSize(9));
        customerSignCell.setBorder(null);
        customerSignCell.setPadding(2);
        signatureTable.addCell(customerSignCell);

        document.add(signatureTable);

        // Policy note at bottom
        document.add(new Paragraph("Nếu có vấn đề cần shop hỗ trợ hãy liên hãy liên hệ qua thông tin bên dưới. Cảm ơn quý khách đã mua hàng")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER));

        document.add(new Paragraph("Hotline: " + SHOP_PHONE)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER));
    }
    /**
     * Class lưu trữ chi tiết tình trạng thanh toán của hóa đơn
     */
    @Data
    @AllArgsConstructor
    private static class PaymentDetails {
        private BigDecimal totalInvoiceAmount;    // Tổng giá trị hóa đơn
        private BigDecimal amountPaid;            // Tổng đã thanh toán
        private BigDecimal amountRefunded;        // Tổng đã hoàn tiền
        private BigDecimal amountDue;             // Số tiền còn phải thu

        /**
         * Kiểm tra xem hóa đơn đã thanh toán đủ chưa
         */
        public boolean isFullyPaid() {
            return amountDue.compareTo(BigDecimal.ZERO) <= 0;
        }

        /**
         * Kiểm tra xem hóa đơn có hoàn tiền không
         */
        public boolean hasRefund() {
            return amountRefunded.compareTo(BigDecimal.ZERO) > 0;
        }
    }

    /**
     * Tính toán chi tiết về tình trạng thanh toán của hóa đơn
     */
    private PaymentDetails calculatePaymentDetails(HoaDon hoaDon) {
        log.debug("Kiểm tra tính toán: Tổng tiền = {}, Phí vận chuyển = {}",
                formatCurrency(hoaDon.getTongTien()),
                hoaDon.getPhiVanChuyen() != null ? formatCurrency(hoaDon.getPhiVanChuyen()) : "0 VNĐ");

        // Lấy tổng tiền (chỉ bao gồm tổng tiền hàng sau giảm giá)
        BigDecimal tongTienSanPham = hoaDon.getTongTien() != null ? hoaDon.getTongTien() : BigDecimal.ZERO;

        // Lấy phí vận chuyển
        BigDecimal phiVanChuyen = hoaDon.getPhiVanChuyen() != null ? hoaDon.getPhiVanChuyen() : BigDecimal.ZERO;

        // Tính tổng thành toán = tổng tiền sản phẩm + phí vận chuyển
        BigDecimal totalAmount = tongTienSanPham.add(phiVanChuyen);

        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalRefunded = BigDecimal.ZERO;

        // Phần code xử lý các thanh toán và hoàn tiền giữ nguyên
        if (hoaDon.getThanhToanHoaDons() != null && !hoaDon.getThanhToanHoaDons().isEmpty()) {
            for (ThanhToanHoaDon payment : hoaDon.getThanhToanHoaDons()) {
                if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID) {
                    totalPaid = totalPaid.add(payment.getSoTien());
                } else if (payment.getTrangThai() == PaymentConstant.PAYMENT_STATUS_REFUND) {
                    totalRefunded = totalRefunded.add(payment.getSoTien());
                }
            }
        }

        // Tính số tiền còn phải thu = Tổng tiền - (Đã thanh toán - Đã hoàn tiền)
        BigDecimal netPaid = totalPaid.subtract(totalRefunded);
        BigDecimal amountDue = totalAmount.subtract(netPaid);

        // Làm tròn để tránh sai số thập phân
        if (amountDue.abs().compareTo(new BigDecimal("0.01")) < 0) {
            amountDue = BigDecimal.ZERO;
        }

        log.debug("Chi tiết thanh toán của hóa đơn {}: Tổng hàng={}, Phí ship={}, Tổng cần TT={}, Đã TT={}, Đã hoàn={}, Còn phải thu={}",
                hoaDon.getMaHoaDon(),
                formatCurrency(tongTienSanPham),
                formatCurrency(phiVanChuyen),
                formatCurrency(totalAmount),
                formatCurrency(totalPaid),
                formatCurrency(totalRefunded),
                formatCurrency(amountDue));

        return new PaymentDetails(totalAmount, totalPaid, totalRefunded, amountDue);
    }

    /**
     * Kiểm tra xem đơn hàng có phải thanh toán COD không
     */
    /**
     * Kiểm tra xem đơn hàng có phải thanh toán COD không dựa trên tình trạng thanh toán thực tế
     * Xử lý cả đơn giao hàng (loaiHoaDon=3) và đơn tại quầy (loaiHoaDon=1)
     */
    private boolean isPaymentCOD(HoaDon hoaDon) {
        // Chỉ xét đơn giao hàng hoặc đơn tại quầy
        if (hoaDon.getLoaiHoaDon() != 3 && hoaDon.getLoaiHoaDon() != 1) {
            return false;
        }

        // Tính chi tiết thanh toán
        PaymentDetails details = calculatePaymentDetails(hoaDon);

        // Nếu đã thanh toán đủ, không phải COD
        if (details.isFullyPaid()) {
            return false;
        }

        // Nếu còn tiền phải thu, kiểm tra xem có thanh toán nào kiểu COD không
        if (details.getAmountDue().compareTo(BigDecimal.ZERO) > 0) {
            // Kiểm tra nếu có phương thức thanh toán COD
            boolean hasCodPaymentMethod = false;

            if (hoaDon.getThanhToanHoaDons() != null && !hoaDon.getThanhToanHoaDons().isEmpty()) {
                for (ThanhToanHoaDon payment : hoaDon.getThanhToanHoaDons()) {
                    if (payment.getPhuongThucThanhToan() != null) {
                        // Kiểm tra bằng cả id và mã phương thức để đảm bảo không bỏ sót
                        if (PaymentConstant.PAYMENT_METHOD_COD.equals(payment.getPhuongThucThanhToan().getId()) ||
                                "COD".equals(payment.getPhuongThucThanhToan().getMaPhuongThucThanhToan())) {
                            hasCodPaymentMethod = true;
                            break;
                        }
                    }
                }

                // Nếu có phương thức COD
                if (hasCodPaymentMethod) {
                    return true;
                }

                // Nếu là đơn giao hàng và chưa có phương thức thanh toán, coi như là COD
                if (hoaDon.getLoaiHoaDon() == 3) {
                    // Kiểm tra xem có phương thức thanh toán nào khác đã được áp dụng chưa
                    boolean hasOtherPaymentMethod = hoaDon.getThanhToanHoaDons().stream()
                            .anyMatch(p -> p.getTrangThai() == PaymentConstant.PAYMENT_STATUS_PAID);

                    // Nếu không có phương thức thanh toán nào khác đã được áp dụng, coi như là COD
                    return !hasOtherPaymentMethod;
                }
            } else {
                // Nếu là đơn giao hàng và không có thông tin thanh toán nào, coi như là COD
                return hoaDon.getLoaiHoaDon() == 3;
            }
        }

        // Mặc định không phải COD
        return false;
    }

    private String formatCurrency(BigDecimal amount) {
        DecimalFormat formatter = new DecimalFormat("#,###");
        return formatter.format(amount) + " VNĐ";
    }
}

