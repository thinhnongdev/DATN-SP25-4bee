import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
	{ name: "Overview", icon: BarChart2,color: "#6366f1", href: "/" },
	{ name: "Phiếu Giảm Giá", icon: ShoppingBag,color: "#8B5CF6", href: "/phieu-giam-gia" },
	{ name: "Users", icon: Users,color: "#10B981", href: "/users" },
	{ name: "Sales", icon: DollarSign,color: "#F59E0B", href: "/sales" },
	{ name: "Orders", icon: ShoppingCart, color: "#3B82F6", href: "/orders" },
	{ name: "Analytics", icon: TrendingUp, color: "#EC4899", href: "/analytics" },
	{ name: "Settings", icon: Settings,color: "#EC4899", href: "/settings" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
				isSidebarOpen ? "w-64" : "w-20"
			}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className='h-full bg-white p-4 flex flex-col border-r border-gray-300'>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-2 rounded-full hover:bg-gray-100 transition-colors max-w-fit text-black'
				>
					<Menu size={24} />
				</motion.button>

				<nav className='mt-8 flex-grow'>
					{SIDEBAR_ITEMS.map((item) => (
						<Link key={item.href} to={item.href}>
							<motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors mb-2 text-black'>
								<item.icon size={20} className='text-black' />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className='ml-4 whitespace-nowrap'
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}
				</nav>
			</div>
		</motion.div>
	);
};

export default Sidebar;
