import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import KhachHang from "./KhachHang";
import CreateForm from "./CreateForm";
import UpdateForm from "./UpdateForm";
import DetailForm from "./DetailForm";
import { getAllApi, getDeleteApi } from "./KhachHangApi";

function KhachHangConfig() {
  const [khachHang, setKhachHang] = useState([]);
  const [appState, setAppState] = useState({
    Creating: false,
    Updating: false,
    View: false,
    selectedKhachHang: null,
  });

  async function getAllKhachHang() {
      try {
        const response = await getAllApi();
        console.log("Dữ liệu từ API:", response); // Log dữ liệu để kiểm tra
    
        if (!response || !response.data) {
          toast.error("Không thể lấy danh sách khách hàng! Phản hồi API không hợp lệ.");
          return null; // Tránh lỗi truy cập thuộc tính undefined
        }
    
        setKhachHang(response.data);
        return response.data; // Trả về dữ liệu để sử dụng trong kiểm tra trùng lặp
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khách hàng:", error);
        toast.error("Lỗi khi lấy danh sách khách hàng!");
        return null; // Tránh lỗi khi gọi hàm này
      }
    }

  const handleViewKhachHang = (id) => {
    setAppState({
      Creating: false,
      Updating: false,
      View: true,
      selectedKhachHang: id,
    });
  };

  const handleDeleteKhachHang = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        await getDeleteApi(id);
        toast.success("Xóa khách hàng thành công!");
        getAllKhachHang();
      } catch (error) {
        console.error("Lỗi khi xóa khách hàng:", error);
        toast.error("Lỗi khi xóa khách hàng!");
      }
    }
  };

  const handleAddKhachHang = () => {
    if (window.confirm("Bạn có chắc chắn muốn thêm khách hàng không")) {
      setAppState({
        Creating: true,
        Updating: false,
        selectedKhachHang: null,
      });
    }
  };

  const handleEditKhachHang = (khachHang) => {
    if (window.confirm("Bạn có chắc chắn muốn sửa khách hàng không")) {
      setAppState({
        Creating: false,
        Updating: true,
        View: false,
        selectedKhachHang: khachHang,
      });
    }
  };

  const handleCloseForm = () => {
    setAppState({
      Creating: false,
      Updating: false,
      View: false,
      selectedKhachHang: null,
    });
    getAllKhachHang();
  };

  useEffect(() => {
    getAllKhachHang();
  }, []);

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />

      {!appState.Creating && !appState.Updating && !appState.View && (
        <KhachHang
          khachHang={khachHang}
          onAddClick={handleAddKhachHang}
          onDeleteClick={handleDeleteKhachHang}
          onEditClick={handleEditKhachHang}
          onViewClick={(id) => handleViewKhachHang(id)}
        />
      )}

      {appState.Creating && (
        <CreateForm
          handleClose={handleCloseForm}
          getAllKhachHang={getAllKhachHang}
        />
      )}

      {appState.Updating && (
        <UpdateForm
          selectedKhachHang={appState.selectedKhachHang}
          handleClose={handleCloseForm}
          getAllKhachHang={getAllKhachHang}
        />
      )}

      {appState.View && (
        <DetailForm
          selectedKhachHang={appState.selectedKhachHang}
          handleClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default KhachHangConfig;
