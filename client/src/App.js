import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InvoiceBuyer from "./pages/invoice/BuyerPage";
import InvoiceSeller from "./pages/invoice/SellerPage";
import IndexPage from "./pages/index/IndexPage";
import Ledger from "./pages/ledger/Ledger";
import ContractTable from "./pages/ledger/ContractTable";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/invoice/buyer" element={<InvoiceBuyer />} />
        <Route path="/invoice/seller" element={<InvoiceSeller />} />
        <Route path="/ledger" element={<Ledger />} />
          <Route path="/ledger/contract" element={<ContractTable />} />
      </Routes>
    </Router>
  );
}

export default App;
