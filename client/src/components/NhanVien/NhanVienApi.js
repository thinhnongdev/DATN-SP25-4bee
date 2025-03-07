import axios from "axios";

const API_URL = "http://localhost:8080/api/nhan_vien";

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
export const getPostApi = (newNhanVien) =>
  axios.post(`${API_URL}`, newNhanVien, {
    headers: { "Content-Type": "application/json" },
  });

export const getPutApi = (id, updateNhanVien) =>
  axios.put(`${API_URL}/${id}`, updateNhanVien);
// export const getDeleteApi = (id) => axios.delete(`${API_URL}/${id}`);
export async function getDeleteApi(id) {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log(`Nhân viên có ID ${id} đã được xóa thành công!`, response);

    return response.data; // Trả về dữ liệu phản hồi từ API
  } catch (error) {
    console.error(`Lỗi khi xóa nhân viên ID ${id}:`, error);

    // Nếu có phản hồi từ server, lấy lỗi chi tiết
    if (error.response) {
      console.error("Phản hồi từ server:", error.response.data);
      return error.response.data; // Trả về lỗi từ server
    } else {
      return { message: "Lỗi kết nối đến server!" }; // Lỗi do server không phản hồi
    }
  }
}

export const getNhanVienById = (id) => axios.get(`${API_URL}/${id}`);

export const scanQRCode = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/scan-qr`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // Trả về dữ liệu nhân viên từ backend
  } catch (error) {
    console.error("Lỗi khi quét QR:", error);
    throw error;
  }
};
