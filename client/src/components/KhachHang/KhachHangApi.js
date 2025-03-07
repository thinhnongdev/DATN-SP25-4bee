import axios from "axios";

const API_URL = "http://localhost:8080/api/khach_hang";

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

export const getPutApi = async (id, updateKhachHang) => {
  try {
    console.log('Updating customer with data:', updateKhachHang);
    const response = await axios.put(`${API_URL}/${id}`,updateKhachHang,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error in getPutApi:", error);
    throw error;
  }
};

export const getDeleteApi = (id) => axios.delete(`${API_URL}/${id}`);
export const getKhachHangById = (id) => axios.get(`${API_URL}/${id}`);
export const getDiaChiByIdKhachHang = (id) => axios.get(`${API_URL}/diaChi/${id}`);
