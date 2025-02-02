import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Sidebar from "./components/common/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import PhieuGiamGiaPage from "./pages/PhieuGiamGiaPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import PhieuGiamGiaAdd from "./components/PhieuGiamGia/PhieuGiamGiaAdd";

function App() {
  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-white opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      <Sidebar />
      <div className="flex-1 overflow-auto">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/phieu-giam-gia" element={<PhieuGiamGiaPage />} />
          <Route path="/users" element={<PhieuGiamGiaAdd />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
