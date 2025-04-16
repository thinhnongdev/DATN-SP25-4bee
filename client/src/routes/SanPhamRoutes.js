import { Routes, Route } from 'react-router-dom';
import SanPham from '../components/QuanLySanPham/SanPham';
import ChatLieu from '../components/QuanLySanPham/ChatLieu';
import KichThuoc from '../components/QuanLySanPham/KichThuoc';
import KieuCoAo from '../components/QuanLySanPham/KieuCoAo';
import KieuCoTayAo from '../components/QuanLySanPham/KieuCoTayAo';
import KieuCuc from '../components/QuanLySanPham/KieuCuc';
import KieuDang from '../components/QuanLySanPham/KieuDang';
import KieuTuiAo from '../components/QuanLySanPham/KieuTuiAo';
import MauSac from '../components/QuanLySanPham/MauSac';
import PostSanPham from '../components/QuanLySanPham/PostSanPham';
import SanPhamChiTiet from '../components/QuanLySanPham/SanPhamChiTiet';
import ThuongHieu from '../components/QuanLySanPham/ThuongHieu';
import HoaTiet from '../components/QuanLySanPham/HoaTiet';
import DanhMuc from '../components/QuanLySanPham/DanhMuc';
import BanHang from '../components/QuanLyBanHang/BanHang';
import ProtectedRoute from './ProtectedRoutes';
// import InvoiceCreate from "../pages/InvoiceCreate";

const SanPhamRoutes = () => {
  return (
    <>
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'NHAN_VIEN']} /> // quyền cho phép
        }
      >
        <Route path="/sanpham" element={<SanPham />} />
        <Route path="/sanpham/chitietsanpham/:id" element={<SanPhamChiTiet />} />
        <Route path="/chatlieu" element={<ChatLieu />} />
        <Route path="/kieucoao" element={<KieuCoAo />} />
        <Route path="/kieucotayao" element={<KieuCoTayAo />} />
        <Route path="/kieucuc" element={<KieuCuc />} />
        <Route path="/kieudang" element={<KieuDang />} />
        <Route path="/mausac" element={<MauSac />} />
        <Route path="/thuonghieu" element={<ThuongHieu />} />
        <Route path="/kichthuoc" element={<KichThuoc />} />
        <Route path="/kieutuiao" element={<KieuTuiAo />} />
        <Route path="/sanpham/addsanpham" element={<PostSanPham />} />
        <Route path="/hoatiet" element={<HoaTiet />} />
        <Route path="/danhmuc" element={<DanhMuc />} />
        <Route path="/banhang" element={<BanHang />} />
      </Route>
    </>
  );
};

export default SanPhamRoutes;
