import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/phieu-giam-gia";
const KHACH_HANG_URL = "http://localhost:8080/api/admin/phieu-giam-gia/khach-hang";

// Lấy token từ localStorage
const token = localStorage.getItem("token");

// Hàm tạo headers có token
const getAuthHeaders = () => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// Phương thức liên quan đến phiếu giảm giá
export const getPhieuGiamGia = () =>
  axios.get(API_URL, { headers: getAuthHeaders() });

export const getPhieuGiamGiaById = (id) =>
  axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });

export const savePhieuGiamGia = (data) =>
  axios.post(API_URL, data, { headers: getAuthHeaders() });

export const updatePhieuGiamGia = (id, data) =>
  axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeaders() });

export const deletePhieuGiamGia = (id) =>
  axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });

export const fetchPhieuGiamGia = (params) =>
  axios.get(`${API_URL}/phan_trang`, { params, headers: getAuthHeaders() });

// Phương thức liên quan đến khách hàng
export const getKhachHang = () =>
  axios.get(KHACH_HANG_URL, { headers: getAuthHeaders() });

export const getKhachHangByMaPhieuGiamGia = (maPhieuGiamGia) =>
  axios.get(`${API_URL}/${maPhieuGiamGia}/khach-hang`, {
    headers: getAuthHeaders(),
  });

export const cancelPhieuGiamGiaForCustomer = (maPhieuGiamGia, maKhachHang) =>
  axios.delete(`${API_URL}/${maPhieuGiamGia}/khach-hang/${maKhachHang}`, {
    headers: getAuthHeaders(),
  });
