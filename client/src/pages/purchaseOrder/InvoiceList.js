import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import Web3 from "web3";
import PurchaseOrderABI from "./PurchaseOrderABI"; // Import the ABI of the smart contract

const InvoiceList = ({ contractAddress }) => {
    const [invoices, setInvoices] = useState([]);

    const provider = window.ethereum;
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(PurchaseOrderABI, contractAddress);

    const columns = [
        { title: "Invoice ID", dataIndex: "id", key: "id" },
        { title: "Order ID", dataIndex: "orderId", key: "orderId" },
        { title: "Seller Address", dataIndex: "seller", key: "seller" },
        { title: "Buyer Address", dataIndex: "buyer", key: "buyer" },
        { title: "Amount", dataIndex: "amount", key: "amount" },
        { title: "Invoice Status", dataIndex: "status", key: "status" },
    ];

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const latestInvoiceId = await contract.methods.invoiceIdCounter().call();

        const invoicesData = [];

        for (let i = 1; i <= latestInvoiceId; i++) {
            const invoiceData = await contract.methods.getInvoice(i).call();
            const status = invoiceData.isInvoicePaid ? "Paid" : "Unpaid";

            invoicesData.push({
                id: invoiceData[0],
                orderId: invoiceData[1],
                seller: invoiceData[2],
                buyer: invoiceData[3],
                amount: invoiceData[4],
                isInvoicePaid: invoiceData[5],
                status: status,
            });
        }

        setInvoices(invoicesData);
    };

    return (
        <div>
            <Table dataSource={invoices} columns={columns} rowKey="id" />
        </div>
    );
};

export default InvoiceList;
