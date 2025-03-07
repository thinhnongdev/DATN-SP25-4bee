import axios from "axios";

export const checkPayment = async (hoaDonId, amount) => {
  try {
    const accountNumber = "102876619993"; // Tài khoản nhận tiền
    const limit = 20;

    const response = await axios.get(
      `http://localhost:8080/api/admin/ban-hang/sepay/transactions`,
      {
        params: { account_number: accountNumber, limit: limit },
      }
    );

    console.log("🔍 Dữ liệu từ API:", response.data);

    const transactions = response.data.transactions;

    if (!Array.isArray(transactions)) {
      console.error(" Dữ liệu transactions không hợp lệ:", transactions);
      return false;
    }

    console.log("Danh sách giao dịch:", transactions);

    // Kiểm tra hóa đơn đã thanh toán chưa
    const matchedTransaction = transactions.find(
      (tx) =>
        parseFloat(tx.amount_in) === parseFloat(amount) &&
        tx.transaction_content.includes(hoaDonId)
    );

    console.log("Giao dịch phù hợp:", matchedTransaction);
    console.log(" amount:", amount);
    console.log(" hoaDonId:", hoaDonId);

    return !!matchedTransaction;
  } catch (error) {
    console.error("Lỗi kiểm tra thanh toán:", error);
    return false;
  }
};