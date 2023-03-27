import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InvoiceBuyer from "./pages/invoice/BuyerPage";
import InvoiceSeller from "./pages/invoice/SellerPage";
import IndexPage from "./pages/index/IndexPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/invoice/buyer" element={<InvoiceBuyer />} />
        <Route path="/invoice/seller" element={<InvoiceSeller />} />
      </Routes>
    </Router>
  );
}

export default App;
