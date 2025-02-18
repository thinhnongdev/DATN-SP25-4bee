import { Routes, Route } from "react-router-dom";
import InvoiceList from "../pages/InvoiceList";
import InvoiceDetail from "../pages/InvoiceDetail";
// import InvoiceCreate from "../pages/InvoiceCreate";

const PhieuGiamGiaRoutes = () => {
  return (
    <>
      <Route path="/hoa-don" element={<InvoiceList />} />
      {/* <Route path="/hoa-don/create" element={<InvoiceCreate />} /> */}
      <Route path="/hoa-don/detail/:id" element={<InvoiceDetail />} />    
      </>
  );
};

export default PhieuGiamGiaRoutes;
