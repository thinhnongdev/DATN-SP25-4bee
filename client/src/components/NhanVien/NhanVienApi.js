import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/nhan_vien';


export async function getAllApi() {
  try {
    const response = await axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    console.log('Phản hồi từ API:', response);
    return response;
  } catch (error) {
    console.error('Lỗi gọi API getAllApi:', error);
    return null;
  }
}

export const getPostApi = (newNhanVien) =>
  axios.post(`${API_URL}`, newNhanVien, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

export const getPutApi = (id, updateNhanVien) =>
  axios.put(`${API_URL}/${id}`, updateNhanVien, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

export async function getDeleteApi(id) {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    console.log(`Nhân viên có ID ${id} đã được xóa thành công!`, response);

    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa nhân viên ID ${id}:`, error);

    if (error.response) {
      console.error('Phản hồi từ server:', error.response.data);
      return error.response.data;
    } else {
      return { message: 'Lỗi kết nối đến server!' };
    }
  }
}

export const getNhanVienById = (id) =>
  axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

export const scanQRCode = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/scan-qr`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi quét QR:', error);
    throw error;
  }
};
