import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAllApi, getDeleteApi } from "../Api/NhanVienApi";
import NhanVien from "./NhanVien";
import CreateForm from "./CreateForm";
import UpdateForm from "./UpdateForm";
import DetailForm from "./DetailForm";

function NhanVienConfig() {
  const [nhanvien, setNhanVien] = useState([]);
  const [appState, setAppState] = useState({
    Creating: false,
    Updating: false,
    View: false,
    selectedNhanVien: null,
  });

  // function getAllNhanVien() {
  //   getAllApi()
  //     .then((response) => {
  //       setNhanVien(response.data);
  //     })
  //     .catch((error) => {
  //       toast.error("Lỗi khi lấy danh sách nhân viên!", error);
  //     });
  // }

  async function getAllNhanVien() {
    try {
      const response = await getAllApi();
      console.log("Dữ liệu từ API:", response); // Log dữ liệu để kiểm tra
  
      if (!response || !response.data) {
        toast.error("Không thể lấy danh sách nhân viên! Phản hồi API không hợp lệ.");
        return null; // Tránh lỗi truy cập thuộc tính undefined
      }
  
      setNhanVien(response.data);
      return response.data; // Trả về dữ liệu để sử dụng trong kiểm tra trùng lặp
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      toast.error("Lỗi khi lấy danh sách nhân viên!");
      return null; // Tránh lỗi khi gọi hàm này
    }
  }

  const handleViewNhanVien = (id) => {
    setAppState({
      Creating: false,
      Updating: false,
      View: true,
      selectedNhanVien: id,
    });
  };

  // const handleDeleteNhanVien = async (id) => {
  //   if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
  //     try {
  //       await getDeleteApi(id);
  //       toast.success("Xóa nhân viên thành công");

  //       await getAllNhanVien();
  //     } catch (error) {
  //       toast.error(`Lỗi khi xóa nhân viên!`, error);
  //     }
  //   }
  // };

  const handleDeleteNhanVien = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
  
    try {
      const result = await getDeleteApi(id);
  
      if (result && result.message) {
        toast.error(result.message); // Hiển thị lỗi từ server
      } else {
        toast.success("Nhân viên đã được xóa thành công!");
        getAllNhanVien(); // Cập nhật danh sách nhân viên
      }
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error);
      toast.error("Không thể xóa nhân viên, vui lòng thử lại!");
    }
  };
  

  const handleAddNhanVien = () => {
    if (window.confirm("Bạn có chắc chắn muốn thêm nhân viên?")) {
      setAppState({ Creating: true, Updating: false, View: false, selectedNhanVien: null });
    }
  };

  const handleEditNhanVien = (nhanVien) => {
    if (window.confirm("Bạn có chắc chắn muốn sửa nhân viên?")) {
      setAppState({
        Creating: false,
        Updating: true,
        View: false,
        selectedNhanVien: nhanVien,
      });
    }
  };

  const handleCloseForm = () => {
    setAppState({
      Creating: false,
      Updating: false,
      View: false,
      selectedNhanVien: null,
    });
  };

  useEffect(() => {
    getAllNhanVien();
  }, []);

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />

      {!appState.Creating && !appState.Updating && !appState.View && (
        <NhanVien
          nhanvien={nhanvien}
          onAddClick={handleAddNhanVien}
          onDeleteClick={handleDeleteNhanVien}
          onEditClick={handleEditNhanVien}
          onViewClick={(id) => handleViewNhanVien(id)}
        />
      )}

      {appState.Creating && (
        <CreateForm
          handleClose={handleCloseForm}
          getAllNhanVien={getAllNhanVien}
        />
      )}

      {appState.Updating && (
        <UpdateForm
          selectedNhanVien={appState.selectedNhanVien}
          handleClose={handleCloseForm}
          getAllNhanVien={getAllNhanVien}
        />
      )}

      {appState.View && (
        <DetailForm
          selectedNhanVien={appState.selectedNhanVien}
          handleClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default NhanVienConfig;
