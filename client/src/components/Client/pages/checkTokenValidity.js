import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/introspect"; // Thay thế bằng URL thật

export const checkTokenValidity = async (token) => {
  try {
    const response = await axios.post(API_URL, { token });
    console.log(response.data);
    if (!response.data.valid) {
      localStorage.removeItem("token"); // Xóa token nếu hết hạn
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking token:", error);
    localStorage.removeItem("token"); // Xóa token khi có lỗi
    return false;
  }
};
