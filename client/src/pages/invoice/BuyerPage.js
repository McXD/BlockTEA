import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Input, Space, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import useContract from "./useContract"; // Assuming you have a custom hook to interact with the smart contract

const { Text } = Typography;
const { confirm } = Modal;

const BuyerPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [newSellerAddress, setNewSellerAddress] = useState("")
  const [loading, setLoading] = useState(true);
  const { contract, addSeller, removeSeller, payInvoice } = useContract();

  useEffect(() => {
    const fetchInvoices = async () => {
      // Fetch invoices and sellers from the contract
        if (!contract) return;

        // Get the total number of invoices
        const invoiceCount = await contract.methods.getInvoiceCount().call();
        console.log("Invoice count:", invoiceCount);


        // Fetch all invoices
        const invoices = [];
        for (let i = 0; i < invoiceCount; i++) {
          const invoice = await contract.methods.getInvoice(i).call();
          invoices.push(invoice);
        }

        setInvoices(invoices);
        setLoading(false);
        console.log("Invoices:", invoices);
    };

    fetchInvoices();
  }, [contract]);

  const showPayInvoiceConfirm = (record) => {
    confirm({
      title: "Do you want to mark this invoice as paid?",
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        const placeholderPaymentHash =
          "0x" +
          "1234567890123456789012345678901234567890123456789012345678901234";
        await payInvoice(
          record.id, placeholderPaymentHash
        );
        // Refresh the invoice list after the payment is marked
      },
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Seller",
      dataIndex: "seller",
      key: "seller",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Paid",
      dataIndex: "paid",
      key: "paid",
      render: (text) =>
        text ? <Text type="success">Yes</Text> : <Text type="danger">No</Text>,
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (_, record) =>
        !record.paid ? (
          <Button type="primary" onClick={() => showPayInvoiceConfirm(record)}>
            Mark as Paid
          </Button>
        ) : null,
    },
  ];

  const handleAddSeller = async () => {
    await addSeller(newSellerAddress);
  };

  const handleRemoveSeller = async () => {
    await removeSeller(newSellerAddress);
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Table
          dataSource={invoices}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          title={() => "Invoices"}
        />
        <Space>
          <Input
            placeholder="Enter seller address"
            value={newSellerAddress}
            onChange={(e) => setNewSellerAddress(e.target.value)}
          />
          <Button type="primary" onClick={handleAddSeller}>
            Add Seller
          </Button>
          <Button type="primary" onClick={handleRemoveSeller} danger>
            Remove Seller
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default BuyerPage;
