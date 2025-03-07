import { Routes, Route } from "react-router-dom";
import PhieuGiamGiaList from "../components/PhieuGiamGia/PhieuGiamGiaList";
import PhieuGiamGiaAdd from "../components/PhieuGiamGia/PhieuGiamGiaAdd";
import UpdatePhieuGiamGia from "../components/PhieuGiamGia/UpdatePhieuGiamGia"
// import InvoiceCreate from "../pages/InvoiceCreate";

const HoaDonRoutes = () => {
  return (
    <>
              <Route path="/phieu-giam-gia" element={<PhieuGiamGiaList />} />
              <Route path="/add-p" element={<PhieuGiamGiaAdd />} />
              <Route path="/update-phieu-giam-gia/:id" element={<UpdatePhieuGiamGia />} />
    </>
  );
};

export default HoaDonRoutes;
