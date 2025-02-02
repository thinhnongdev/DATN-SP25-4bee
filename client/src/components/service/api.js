import axios from "axios";

const API_URL = "http://localhost:8080/api/phieu-giam-gia";
const KHACH_HANG_URL = "http://localhost:8080/api/phieu-giam-gia/khach-hang";

// Phương thức liên quan đến phiếu giảm giá
export const getPhieuGiamGia = () => axios.get(API_URL);
export const getPhieuGiamGiaById = (id) => axios.get(`${API_URL}/${id}`);
export const savePhieuGiamGia = (data) => axios.post(API_URL, data);
export const updatePhieuGiamGia = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deletePhieuGiamGia = (id) => axios.delete(`${API_URL}/${id}`);
export const fetchPhieuGiamGia = (params) => axios.get(`${API_URL}/phan_trang`, { params });

// Phương thức liên quan đến khách hàng
export const getKhachHang = () => axios.get(KHACH_HANG_URL);
