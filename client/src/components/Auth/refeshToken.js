import axios from "axios";
import jwtDecode from "jwt-decode";

const API_URL = "http://localhost:8080/api/auth/refreshToken";

const getAccessToken = () => localStorage.getItem("token");

// Kiểm tra token sắp hết hạn chưa (dưới 5 phút)
const isTokenAboutToExpire = (token) => {
  if (!token) return true;
  const decoded = jwtDecode(token);
  const currentTime = Date.now() / 1000;
  return decoded.exp - currentTime < 300; // 300 giây = 5 phút
};

// Tạo axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gọi API gia hạn token nếu sắp hết hạn
api.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  if (token && isTokenAboutToExpire(token)) {
    console.log("🔄 Token sắp hết hạn, đang gia hạn...");

    try {
      const response = await axios.post(`${API_URL}/auth/renew-token`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newToken = response.data.accessToken;
      localStorage.setItem("token", newToken);
      token = newToken;

      console.log(" Token đã gia hạn thành công!");
    } catch (err) {
      console.error(" Gia hạn token thất bại:", err);
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(err);
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Xử lý lỗi hết hạn hoàn toàn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      console.error(" Hết phiên làm việc. Đăng nhập lại!");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
