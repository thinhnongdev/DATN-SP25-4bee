import { message } from "antd";
import api from "../../utils/api";

/**
 * Calculate discount amount for a voucher
 */
export const calculateDiscountAmount = (voucher, total) => {
  if (!voucher || !total || total < voucher.giaTriToiThieu) {
    return 0;
  }

  let discountAmount = 0;

  if (voucher.loaiPhieuGiamGia === 1) {
    discountAmount = Math.floor((total * voucher.giaTriGiam) / 100);
    if (voucher.soTienGiamToiDa && voucher.soTienGiamToiDa > 0) {
      discountAmount = Math.min(discountAmount, voucher.soTienGiamToiDa);
    }
  } else {
    discountAmount = Math.min(voucher.giaTriGiam, total);
  }

  discountAmount = Math.max(0, Math.min(discountAmount, total));
  return discountAmount;
};

/**
 * Find the best voucher for an order
 */
export const findBestVoucher = async (totalBeforeVoucher, customerId = "") => {
  try {
    const response = await api.get(
      `/api/admin/phieu-giam-gia/available?orderTotal=${totalBeforeVoucher}&customerId=${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const availableVouchers = response.data || [];

    if (!availableVouchers.length) {
      return null;
    }

    return availableVouchers.reduce((best, current) => {
      if (totalBeforeVoucher < current.giaTriToiThieu) return best;

      const currentDiscount = calculateDiscountAmount(
        current,
        totalBeforeVoucher
      );
      const bestDiscount = best
        ? calculateDiscountAmount(best, totalBeforeVoucher)
        : 0;

      return currentDiscount > bestDiscount ? current : best;
    }, null);
  } catch (error) {
    console.error("Error finding best voucher:", error);
    return null;
  }
};

/**
 * Apply the best voucher to an order
 */
export const applyVoucher = async (hoaDonId, voucherId) => {
  try {
    const response = await api.post(
      `/api/admin/hoa-don/${hoaDonId}/voucher`,
      { voucherId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error applying voucher:", error);
    message.error("Lỗi khi áp dụng voucher");
    return null;
  }
};
