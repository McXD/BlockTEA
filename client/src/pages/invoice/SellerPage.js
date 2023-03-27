import React, { useState } from "react";
import { Button, Card, Input, Typography, notification } from "antd";
import useContract from "./useContract";

const { Title } = Typography;

const SellerPage = () => {
  const { createInvoice } = useContract();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    try {
      await createInvoice(amount, description);
      notification.success({ message: "Invoice submitted successfully!" });
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error(error);
      notification.error({ message: "Failed to submit the invoice" });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3}>Submit Invoice</Title>
        <div style={{ marginBottom: 16 }}>
          <Input
            addonBefore="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter invoice amount"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter invoice description"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </div>
        <Button type="primary" onClick={handleSubmit}>
          Submit Invoice
        </Button>
      </Card>
    </div>
  );
};

export default SellerPage;
