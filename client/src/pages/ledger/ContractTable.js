import { useState, useEffect } from "react";
import { Button, Space, Table, Form, Input, Modal } from "antd";
import config from "../../config";
import axios from "axios";

const App = () => {
    const [smartContracts, setSmartContracts] = useState([]);
    const [isAddContractModalVisible, setIsAddContractModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/api/contracts`);
                setSmartContracts(response.data);
                console.log(response.data)
            } catch (error) {
                console.error(error);
            }
        };

        fetchContracts();
    }, []);

    const expandedRowRender = (record) => {
        const events = record.contract_abi.filter(item => item.type === 'event');

        const formattedEvents = events.map((event, index) => {
            const parameters = event.inputs.length > 0
                ? event.inputs.map(input => `${input.name} (${input.type})`).join(', ')
                : 'No parameters';

            return {
                key: index.toString(),
                name: event.name,
                parameters
            };
        });

        const columns = [
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Parameters', dataIndex: 'parameters', key: 'parameters' },
            {
                title: 'Action',
                key: 'operation',
                render: () => (
                    <Space size='middle'>
                        <a>Configure</a>
                    </Space>
                ),
            },
        ];

        return <Table columns={columns} dataSource={formattedEvents} pagination={false} />;
    };


    const columns = [
        { title: "Name", dataIndex: "contract_name", key: "contract_name" },
        { title: "Address", dataIndex: "contract_address", key: "contract_address" },
        { title: "Owner", dataIndex: "owner", key: "owner" },
        {
            title: "Action",
            key: "operation",
            render: () => (
                <Space size="middle">
                    <a>Edit</a>
                    <a>Delete</a>
                </Space>
            ),
        },
    ];

    const handleAddContract = async (values) => {
        try {
            const parsedAbi = JSON.parse(values.abi);
            const contractData = {
                ...values,
                abi: parsedAbi,
            };

            const response = await axios.post(`${config.apiBaseUrl}/api/contracts`, contractData);
            const newSmartContract = response.data;
            setSmartContracts([...smartContracts, newSmartContract]);
            setIsAddContractModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
        }
    };


    const showAddContractModal = () => {
        setIsAddContractModalVisible(true);
    };

    const handleCancel = () => {
        setIsAddContractModalVisible(false);
    };


    return (
        <>
            <h1>Smart Contracts</h1>
            <Table
                columns={columns}
                expandable={{
                    expandedRowRender,
                }}
                dataSource={smartContracts}
                size="small"
                rowKey="contract_address"
            />
            <Button type="primary" style={{ marginTop: 16 }} onClick={showAddContractModal}>
                Add Contract
            </Button>
            <Modal
                title="Add Contract"
                visible={isAddContractModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddContract}
                >
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the contract name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: 'Please input the contract address!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Owner"
                        name="owner"
                        rules={[{ required: true, message: 'Please input the contract address!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="ABI"
                        name="abi"
                        rules={[{ required: true, message: 'Please input the contract ABI!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Add
                            </Button>
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

        </>
    );
};

export default App;
