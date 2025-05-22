import { Routes, Route } from 'react-router-dom';
import KhachHangConfig from '../components/KhachHang/KhachHangConfig';
import ProtectedRoute from './ProtectedRoutes';

const KhachHangRoutes = () => {
  return (
    <>
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} /> // quyền cho phép
        }
      >
        <Route path="/khachhang" element={<KhachHangConfig />} />
      </Route>
    </>
  );
};

export default KhachHangRoutes;
