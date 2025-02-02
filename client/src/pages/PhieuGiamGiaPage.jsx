import { ToastContainer } from "react-toastify";
import Header from "../components/common/Header";
import PhieuGiamGiaList from "../components/PhieuGiamGia/PhieuGiamGiaList";
import OverviewPage from "./OverviewPage";
import { Route, Routes } from "react-router-dom";
// import PhieuGiamGiaAdd from "../components/PhieuGiamGia/PhieuGiamGiaAdd";
import UpdatePhieuGiamGia from "../components/PhieuGiamGia/UpdatePhieuGiamGia";
import PhieuGiamGiaAdd from "../components/PhieuGiamGia/PhieuGiamGiaAdd";


const PhieuGiamGiaPage = () => {



	// const SIDEBAR_ITEMS = [
	// 	{
	// 		name: "Overview",
	// 		icon: BarChart2,
	// 		color: "#6366f1",
	// 		href: "/",
	// 	},
	// 	{ name: "Phiếu Giảm Giá", icon: ShoppingBag, color: "#8B5CF6", href: "/phieu-giam-gia" },
	// 	{ name: "Users", icon: Users, color: "#EC4899", href: "/users" },
	// 	{ name: "Sales", icon: DollarSign, color: "#10B981", href: "/sales" },
	// 	{ name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
	// 	{ name: "Analytics", icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
	// 	{ name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
	// ];

	return (
		<div className="flex-1 overflow-auto relative z-10">
			<Header title="Phiếu Giảm Giá" />
			<ToastContainer /> {/* Hiển thị thông báo */}

			<Routes>
				{/* Trang tổng quan */}
				<Route path="/" element={<OverviewPage />} />

				{/* Các route con cho phiếu giảm giá */}
				<Route path="users" element={<PhieuGiamGiaAdd />} />
				<Route path="update/:id" element={<UpdatePhieuGiamGia />} />

				{/* Đặt một route chính cho danh sách phiếu giảm giá */}
				<Route index element={<PhieuGiamGiaList />} />
			</Routes>

		</div>
	);
};

export default PhieuGiamGiaPage;
