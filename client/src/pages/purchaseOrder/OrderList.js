import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import Web3 from "web3";
import PurchaseOrderABI from "./PurchaseOrderABI"; // Import the ABI of the smart contract

const OrderList = ({ contractAddress, role }) => {
    const [orders, setOrders] = useState([]);
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();

    const provider = window.ethereum;
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(PurchaseOrderABI, contractAddress);

    const columns = [
        { title: "Order ID", dataIndex: "id", key: "id" },
        { title: "Seller Address", dataIndex: "seller", key: "seller" },
        { title: "Product", dataIndex: "product", key: "product" },
        { title: "Quantity", dataIndex: "quantity", key: "quantity" },
        { title: "Price", dataIndex: "price", key: "price" },
        { title: "Total", dataIndex: "total", key: "total"},
        { title: "Order Status", dataIndex: "status", key: "status" },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => {
                if (role === "buyer") {
                    return (
                                <Button
                                    type="primary"
                                    disabled={!record.isOrderConfirmed || record.isInvoicePaid}
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => payInvoice(record.id)}
                                >
                                    Pay Invoice
                                </Button>
                    );
                } else if (role === "seller") {
                    return (
                        <>
                            <Button
                                type="primary"
                                disabled={record.isOrderConfirmed}
                                onClick={() => confirmOrder(record.id)}
                            >
                                Confirm
                            </Button>
                                <Button
                                    type="primary"
                                    disabled={!record.isOrderConfirmed || record.isInvoiceIssued}
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => createInvoice(record.id)}
                                >
                                    Create Invoice
                                </Button>
                        </>
                    );
                }
                return null;
            },
        },
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const latestOrderId = await contract.methods.orderIdCounter().call();

        const orders = [];

        for (let i = 1; i <= latestOrderId; i++) {
            const orderData = await contract.methods.getOrder(i).call();
            console.log(orderData)
            const status = getOrderStatus(orderData);

            // If the role is seller, only show relevant orders
            console.log(role, orderData[1], window.ethereum.selectedAddress)
            // lowercase the address to compare
            if (role === "seller" && orderData[1].toLowerCase() !== window.ethereum.selectedAddress.toLowerCase()) {
                continue;
            }

            orders.push({
                id: orderData[0],
                seller: orderData[1],
                product: orderData[2],
                quantity: orderData[3],
                price: orderData[4],
                total: orderData[3] * orderData[4],
                isOrderConfirmed: orderData[5],
                isOrderCompleted: orderData[6],
                isInvoiceIssued: orderData[7],
                isInvoicePaid: orderData[8],
                status: status,
            });
        }

        console.log(orders)
        setOrders(orders);
    };

    const getOrderStatus = (orderData) => {
        console.log(orderData)
        if (!orderData.isOrderConfirmed) {
            return "Unconfirmed";
        }

        if (orderData.isInvoiceCreated && !orderData.isInvoicePaid) {
            return "Invoice Issued";
        }

        if (orderData.isInvoicePaid) {
            return "Invoice Paid";
        }

        return "Confirmed";
    };

    const showModal = () => {
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const onFinish = async (values) => {
        try {
            const accounts = await web3.eth.getAccounts();
            await contract.methods
                .createOrder(values.seller, values.product, values.quantity, values.price)
                .send({ from: accounts[0] });
            message.success("Order created successfully!");
            fetchOrders();
            setOpen(false);
            form.resetFields();
        } catch (error) {
            message.error("Error creating the order!");
            console.error(error);
        }
    };

    const confirmOrder = async (orderId) => {
        try {
            const accounts = await web3.eth.getAccounts();
            await contract.methods.confirmOrder(orderId).send({ from: accounts[0] });
            message.success("Order confirmed!");
            fetchOrders();
        } catch (error) {
            message.error("Error confirming the order!");
            console.error(error);
        }
    };

    const createInvoice = async (orderId) => {
        try {
            const accounts = await web3.eth.getAccounts();
            await contract.methods.createInvoice(orderId).send({ from: accounts[0] });
            message.success("Invoice created!");
            fetchOrders();
        } catch (error) {
            message.error("Error creating the invoice!");
            console.error(error);
        }
    };

    const payInvoice = async (orderId) => {
        try {
            const accounts = await web3.eth.getAccounts();
            const order = orders.filter((order) => order.id === orderId)[0];
            await contract.methods.payInvoice(orderId)
                .send({ from: accounts[0], value: web3.utils.toWei(order.total.toString(), "ether") });
            message.success("Invoice paid successfully!");
            fetchOrders();
        } catch (error) {
            message.error("Error paying the invoice!");
            console.error(error);
        }
    };


    return (
        <div>
            <Table dataSource={orders} columns={columns} rowKey="id" />
            {role === "buyer" && <Button type="primary" onClick={showModal}>
                Create Order
            </Button>}
            <Modal title="Create Order" open={open} onCancel={handleCancel} footer={null}>
                <Form form={form} onFinish={onFinish}>
                    <Form.Item
                        label="Seller Address"
                        name="seller"
                        rules={[
                            {
                                required: true,
                                message: "Please input the seller address!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Product"
                        name="product"
                        rules={[
                            {
                                required: true,
                                message: "Please input the product name!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Quantity"
                        name="quantity"
                        rules={[
                            {
                                required: true,
                                message: "Please input the quantity!",
                            },
                        ]}
                    >
                        <Input type="number" min="1" />
                    </Form.Item>
                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[
                            {
                                required: true,
                                message: "Please input the price!",
                            },
                        ]}
                    >
                        <Input type="number" min="1" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create Order
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrderList;