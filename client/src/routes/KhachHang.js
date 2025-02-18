import { Routes, Route } from "react-router-dom";
import KhachHangConfig from "../components/KhachHang/KhachHangConfig";

const KhachHangRoute = () => {
  return (
    <>
      <Route path='/khachHang' element={<KhachHangConfig/>}/>
    </>
  );
};

export default KhachHangRoute;
