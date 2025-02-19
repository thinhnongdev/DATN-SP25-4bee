import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { getAllApi } from "./KhachHangApi";
import KhachHang from "./KhachHang";
import CreateForm from "./CreateForm";
import DetailForm from "./DetailForm";

function KhachHangConfig() {
  const [khachHang, setKhachHang] = useState([]);
  const [appState, setAppState] = useState({
    Creating: false,
    View: false,
    selectedKhachHang: null,
  });

  const getAllKhachHang = async () => {
    try {
      const response = await getAllApi();
      console.log("Dữ liệu từ API:", response);

      if (!response || !response.data) {
        toast.error("Không thể lấy danh sách khách hàng!");
        return null;
      }

      setKhachHang(response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      toast.error("Lỗi khi lấy danh sách khách hàng!");
      return null;
    }
  };

  const handleAddKhachHang = () => {
    setAppState({
      Creating: true,
      View: false,
      selectedKhachHang: null,
    });
  };

  const handleViewKhachHang = (id) => {
    if (!id) {
      console.error("ID khách hàng không hợp lệ:", id);
      return;
    }
    setAppState({
      Creating: false,
      View: true,
      selectedKhachHang: id,
    });
  };
  

  const handleCloseForm = () => {
    setAppState({
      Creating: false,
      View: false,
      selectedKhachHang: null,
    });
  };

  useEffect(() => {
    getAllKhachHang();
  }, []);

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />

      {!appState.Creating && !appState.View && (
        <KhachHang 
          khachHang={khachHang} 
          onAddClick={handleAddKhachHang} 
          onViewClick={(id) => handleViewKhachHang(id)}
        />
      )}

      {appState.Creating && (
        <CreateForm
          handleClose={handleCloseForm}
          getAllKhachHang={getAllKhachHang}
        />
      )}
      {appState.View && (
        <DetailForm
          selectedKhachHang={appState.selectedKhachHang}
          handleClose={handleCloseForm}
          getAllKhachHang={getAllKhachHang}
        />
      )}
    </div>
  );
}

export default KhachHangConfig;
