import { Routes, Route } from "react-router-dom";
import InvoiceList from "../pages/InvoiceList";
import InvoiceDetail from "../pages/InvoiceDetail";
import BanHang from "../components/QuanLyBanHang/BanHang";

const HoaDonRoutes = () => {
  return (
    <>
      <Route path="/hoa-don" element={<InvoiceList />} />
      <Route path="/ban-hang" element={<BanHang />} />
      <Route path="/hoa-don/detail/:id" element={<InvoiceDetail />} />
    </>
  );
};

export default HoaDonRoutes;