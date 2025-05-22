import axios from "axios";

export const checkPayment = async (hoaDonId, amount) => {
  try {
    const accountNumber = "102876619993"; // Tài khoản nhận tiền
    const limit = 20;

    // 1. Trước tiên lấy thông tin hóa đơn để có mã hóa đơn
    let maHoaDon;
    try {
      const orderResponse = await axios.get(
        `http://localhost:8080/api/admin/hoa-don/${hoaDonId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
      );
      maHoaDon = orderResponse.data?.maHoaDon || hoaDonId;
    } catch (error) {
      console.error("Không thể lấy thông tin hóa đơn:", error);
      maHoaDon = hoaDonId; // Sử dụng ID gốc nếu không lấy được mã hóa đơn
    }

    // 2. Lấy danh sách giao dịch
    const response = await axios.get(
      `http://localhost:8080/api/admin/ban-hang/sepay/transactions`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
    console.log("Mã hóa đơn cần tìm:", maHoaDon);
    console.log("ID hóa đơn cần tìm:", hoaDonId);

    // 3. Kiểm tra hóa đơn đã thanh toán chưa (không sử dụng await trong callback)
    const matchedTransaction = transactions.find((tx) => {
      // Kiểm tra số tiền
      const matchAmount = parseFloat(tx.amount_in) === parseFloat(amount);
      
      // Kiểm tra nội dung thanh toán có chứa mã hóa đơn hoặc ID
      const matchContent = 
        tx.transaction_content.includes(maHoaDon) || 
        tx.transaction_content.includes(hoaDonId);
      
      // Ghi log để debug
      if (matchAmount) {
        console.log(`Tìm thấy giao dịch có số tiền khớp: ${tx.amount_in}`);
        console.log(`Nội dung giao dịch: ${tx.transaction_content}`);
        console.log(`Nội dung có chứa mã hóa đơn hoặc ID: ${matchContent}`);
      }
      
      return matchAmount && matchContent;
    });

    console.log("Giao dịch phù hợp:", matchedTransaction);
    console.log(" amount:", amount);
    console.log(" hoaDonId:", hoaDonId);

    return !!matchedTransaction;
  } catch (error) {
    console.error("Lỗi kiểm tra thanh toán:", error);
    return false;
  }
};