package com.example.server.constant;

public class PaymentConstant {
    // Mã phương thức thanh toán
    public static final String PAYMENT_METHOD_COD = "PTTT001";    // Thanh toán khi nhận hàng
    public static final String PAYMENT_METHOD_BANK = "PTTT002";   // Chuyển khoản
    public static final String PAYMENT_METHOD_CASH = "PTTT003";   // Tiền mặt

    // Trạng thái thanh toán
    public static final int PAYMENT_STATUS_PAID = 1;          // Đã thanh toán
    public static final int PAYMENT_STATUS_UNPAID = 2;        // Chưa thanh toán
    public static final int PAYMENT_STATUS_COD = 3;          // Trả sau (COD)
}