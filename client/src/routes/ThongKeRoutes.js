import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import ProtectedRoute from './ProtectedRoutes';
import ThongkeList from '../components/Thongke/ThongkeList';

const ThongkeRoutes = () => {
  return (
    <>
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} /> // quyền cho phép
        }
      >
        <Route path="/thongke" element={<ThongkeList />} /> {/* Hiển thị ThongkeList ở /admin */}
      </Route>
    </>
  );
};

export default ThongkeRoutes;
