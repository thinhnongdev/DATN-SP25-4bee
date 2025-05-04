import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import InvoiceList from '../pages/InvoiceList';
import InvoiceDetail from '../pages/InvoiceDetail';
import BanHang from '../components/QuanLyBanHang/BanHang';
import ProtectedRoute from './ProtectedRoutes';

const HoaDonRoutes = () => {
  return (
    <>
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'NHAN_VIEN']} /> // quyền cho phép
        }
      >
        <Route path="/hoa-don" element={<InvoiceList />} />
        <Route path="/ban-hang" element={<BanHang />} />
        <Route path="/hoa-don/detail/:id" element={<InvoiceDetail />} />
      </Route>
    </>
  );
};

export default HoaDonRoutes;
