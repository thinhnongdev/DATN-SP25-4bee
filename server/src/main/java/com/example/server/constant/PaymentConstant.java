package com.example.server.constant;

public class PaymentConstant {
    // ID phương thức thanh toán
    public static final String PAYMENT_METHOD_COD = "PTTT001";    // Thanh toán khi nhận hàng
    public static final String PAYMENT_METHOD_BANK = "PTTT002";   // Chuyển khoản
    public static final String PAYMENT_METHOD_CASH = "PTTT003";   // Tiền mặt
    public static final String PAYMENT_METHOD_VNPAY = "PTTT004"; // Thanh toán bằng vn pay

    // Trạng thái thanh toán
    public static final int PAYMENT_STATUS_PAID = 1;          // Đã thanh toán
    public static final int PAYMENT_STATUS_UNPAID = 2;        // Chưa thanh toán
    public static final int PAYMENT_STATUS_COD = 3;           // Trả sau (COD)
    public static final int PAYMENT_STATUS_REFUND = 4;        // Hoàn tiền (sử dụng trạng thái 4 hiện có)

    // Constants cho mô tả loại thanh toán (sử dụng trường moTa)
    public static final String PAYMENT_TYPE_NORMAL = "Thanh toán đơn hàng";
    public static final String PAYMENT_TYPE_REFUND = "Hoàn tiền do thay đổi giá sản phẩm giảm";
    public static final String PAYMENT_TYPE_REFUND_EXCESS = "Hoàn tiền thừa cho khách hàng";
    public static final String PAYMENT_TYPE_REFUND_VOUCHER = "Hoàn tiền thừa sau khi áp dụng voucher";
    public static final String PAYMENT_TYPE_REFUND_SHIPPING = "Hoàn tiền thừa sau khi tính lại phí vận chuyển";
    public static final String PAYMENT_TYPE_ADDITIONAL = "Thanh toán phụ phí do thay đổi giá sản phẩm";
}