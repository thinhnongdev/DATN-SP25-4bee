import { message } from 'antd';
import axios from 'axios';

const API_URL = 'https://datn-sp25-4bee.onrender.com/api/client/khach_hang';

// Hàm tạo headers kèm token
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// API: Lấy tất cả khách hàng
export async function getAllApi() {
  try {
    const response = await axios.get(`${API_URL}`, {
      headers: getAuthHeaders(),
    });
    console.log('Phản hồi từ API:', response);
    return response;
  } catch (error) {
    console.error('Lỗi gọi API getAllApi:', error);
    return null;
  }
}

// API: Thêm mới khách hàng
export const getPostApi = (newKhachHang) =>
  axios.post(`${API_URL}`, newKhachHang, {
    headers: getAuthHeaders(),
  });

// API: Cập nhật thông tin khách hàng
export const getPutApi = async (id, updateKhachHang) => {
  try {
    console.log('Updating customer with data:', updateKhachHang);
    const response = await axios.put(`${API_URL}/${id}`, updateKhachHang, {
      headers: getAuthHeaders(),
    });
    // message.success('Cập nhật thành công');
    return response;
  } catch (error) {
    console.error('Error in getPutApi:', error);
    throw error;
  }
};

// API: Yêu cầu đặt lại mật khẩu
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`https://datn-sp25-4bee.onrender.com/api/auth/khach-hang/forgot-password?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi yêu cầu đặt lại mật khẩu:', error);
    throw error;
  }
};
// API: Xóa khách hàng theo ID
export const getDeleteApi = (id) =>
  axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

// API: Lấy thông tin khách hàng theo ID
export const getKhachHangById = (id) =>
  axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

// API: Lấy địa chỉ của khách hàng theo ID
export const getDiaChiByIdKhachHang = (id) =>
  axios.get(`${API_URL}/diaChi/${id}`, {
    headers: getAuthHeaders(),
  });
  export const getKhachHangByEmail = (email) =>
    axios.get(`${API_URL}/${email}`, {
      headers: getAuthHeaders(),
    });
