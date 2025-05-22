import { Routes, Route } from 'react-router-dom';
import NhanVienConfig from '../components/NhanVien/NhanVienConfig';
import ProtectedRoute from './ProtectedRoutes';

const NhanVienRoutes = () => {
  return (
    <>
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} /> // quyền cho phép
        }
      >
        <Route path="/nhanvien" element={<NhanVienConfig />} />
      </Route>
    </>
  );
};

export default NhanVienRoutes;
