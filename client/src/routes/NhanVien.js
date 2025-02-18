import { Routes, Route } from "react-router-dom";
import NhanVienConfig from "../components/NhanVien/NhanVienConfig";

const NhanVienRoute = () => {
  return (
    <>
      <Route path='/nhanVien' element={<NhanVienConfig/>}/>
    </>
  );
};

export default NhanVienRoute;
