import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Đảm bảo đã import CSS của react-toastify
import Header from "../components/common/Header";
import PhieuGiamGiaAdd from "../components/PhieuGiamGia/PhieuGiamGiaAdd";

const UsersPage = () => {
	return (
		<div className="flex flex-col h-screen">
			{/* Toast notifications */}
			<ToastContainer />
			{/* Header */}
			<Header title="Users" />
			{/* Main Content */}
			<div className="flex-1 overflow-auto p-4">
				<PhieuGiamGiaAdd />
			</div>
		</div>
	);
};

export default UsersPage;
