import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import InvoiceBuyer from "./pages/invoice/BuyerPage";
import InvoiceSeller from "./pages/invoice/SellerPage";
import IndexPage from "./pages/index/IndexPage";
import Ledger from "./pages/ledger/Ledger";
import ContractTable from "./pages/ledger/ContractTable";
import PurchaseOrderOwner from "./pages/purchaseOrder/Owner";
import PurchaseOrderSeller from "./pages/purchaseOrder/Seller";
import AssetTransfer from "./pages/asset";
import Menu from "./Menu.js"


function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Menu/>}/>
                    <Route path="/invoice/buyer" element={<InvoiceBuyer/>}/>
                    <Route path="/invoice/seller" element={<InvoiceSeller/>}/>
                    <Route path="/ledger" element={<Ledger/>}/>
                    <Route path="/ledger/contract" element={<ContractTable/>}/>
                    <Route path="/purchaseOrder/owner" element={<PurchaseOrderOwner/>}/>
                    <Route path="/purchaseOrder/seller" element={<PurchaseOrderSeller/>}/>
                    <Route path="/asset-transfer/*" element={<AssetTransfer/>}/>
                </Routes>
            </Router>
        </>
    );
}

export default App;
