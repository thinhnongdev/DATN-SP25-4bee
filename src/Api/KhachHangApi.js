import axios from "axios";

const API_URL = "http://localhost:8080/api/khachhang";

// export const getAllApi = () => axios.get(`${API_URL}`);
export async function getAllApi() {
    try {
      const response = await axios.get(`${API_URL}`);
      console.log("Phản hồi từ API:", response);
      return response;
    } catch (error) {
      console.error("Lỗi gọi API getAllApi:", error);
      return null;
    }
  }
export const getPostApi = (newKhachHang) => axios.post(`${API_URL}`, newKhachHang);
export const getPutApi = (id, updateKhachHang) => axios.put(`${API_URL}/${id}`, updateKhachHang);
export const getDeleteApi = (id) => axios.delete(`${API_URL}/${id}`);
export const getKhachHangById = (id) => axios.get(`${API_URL}/${id}`)