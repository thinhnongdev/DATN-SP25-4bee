import { Route } from 'react-router-dom';
import SearchOrder from '../components/Client/pages/SearchOrder';
import ListOrder from '../components/Client/pages/thongtintaikhoan/ListOrder';
import OrderDetail from '../components/Client/pages/thongtintaikhoan/OrderDetail';
import TaiKhoanCuaToi from '../components/Client/pages/thongtintaikhoan/TaiKhoanCuaToi';
import DanhSachVoucher from '../components/Client/pages/thongtintaikhoan/DanhSachVoucher';
import HomeClient from '../components/Client/pages/Home';
import ProductsClient from '../components/Client/pages/Products';
import ProductDetailClient from '../components/Client/pages/ProductDetail';
import CartClient from '../components/Client/pages/Cart';
import ContactClient from '../components/Client/pages/Contact';
import Checkout from '../components/Client/pages/Checkout';
import OrderSuccessPage from '../components/Client/pages/OrderSuccess';
import PaymentSuccessByVnPay from '../components/Client/pages/PaymentSuccessByVnPay';
import AboutUsPage from '../components/Client/pages/AboutUsPage';
const ClientRoutes = () => {
  {
    return (
      <>
        <Route path="/" element={<HomeClient />} />
        <Route path="/products" element={<ProductsClient />} />
        <Route path="/product/:id" element={<ProductDetailClient />} />
        <Route path="/cart" element={<CartClient />} />
        <Route path="/contact" element={<ContactClient />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/vnpay/payment-success" element={<PaymentSuccessByVnPay />} />
        <Route path="/searchOrder" element={<SearchOrder />} />
        <Route path="/danhsachdonhang" element={<ListOrder />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/myprofile" element={<TaiKhoanCuaToi />} />
        <Route path="/danhsachvoucher" element={<DanhSachVoucher />} />
        <Route path="/about" element={<AboutUsPage />} />
      </>
    );
  }
};
export default ClientRoutes;
