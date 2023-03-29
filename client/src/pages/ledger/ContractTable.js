import { useState, useEffect } from "react";
import { Button, Space, Table, Form, Input, Modal, Select, Collapse, Row, Col } from "antd";
import config from "../../config";
import axios from "axios";

const { Option } = Select;
const { Panel } = Collapse;

const App = () => {
    const [smartContracts, setSmartContracts] = useState([]);
    const [isAddContractModalVisible, setIsAddContractModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
    const [currentContract, setCurrentContract] = useState(null);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [eventEffects, setEventEffects] = useState([]);
    const [formConfig] = Form.useForm();
    const [accounts, setAccounts] = useState([]);


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

        const fetchAccounts = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/api/ledger/accounts`);
                setAccounts(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchContracts();
        fetchAccounts();
    }, []);

    const expandedRowRender = (record) => {
        setCurrentContract(record)
        console.log("currentContract: ", currentContract)
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
                render: (_, event) => (
                    <Space size="middle">
                        <a onClick={() => showConfigModal(event)}>Configure</a>
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

    const handleConfigCancel = () => {
        setIsConfigModalVisible(false);
    };

    const handleConfigureEvent = async (values) => {
        try {
            // Submit the configuration data to the API
            const response = await axios.post(`${config.apiBaseUrl}/api/config/contracts/${currentContract._id}/${currentEvent.name}`, values);
            setIsConfigModalVisible(false);
            formConfig.resetFields();
        } catch (error) {
            console.error(error);
        }
    };

    const fetchConfigurations = async (eventName) => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}/api/config/contracts/${currentContract._id}/${eventName}`);
            if (response.data) {
                setEventEffects(response.data.eventEffects);
            } else {
                setEventEffects([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteConfiguration = async (effectId) => {
        try {
            await axios.delete(`${config.apiBaseUrl}/api/config/contracts/${currentContract._id}/${currentEvent.name}/${effectId}`);
            setEventEffects(eventEffects.filter((config) => config._id !== effectId));
        } catch (error) {
            console.error(error);
        }
    };


    const showConfigModal = (event) => {
        setCurrentEvent(event);
        console.log("currentEvent: ", event)
        fetchConfigurations(event.name); // Assuming event.key is the event ID
        setIsConfigModalVisible(true);
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
            <Modal
                title={`Configure ${currentEvent ? currentEvent.name : ""}`}
                visible={isConfigModalVisible}
                onCancel={handleConfigCancel}
                footer={null}
                width={800}
            >
                <Collapse accordion>
                    {eventEffects.map((effect, index) => (
                        <Panel header={`Configuration ${index + 1}`} key={effect._id}>
                            <Row>
                                <Col span={12}>
                                    <h4>Account: {accounts.find((account) => account._id === effect.accountId).name}</h4>
                                    <h4>Amount Field: {effect.amountField}</h4>
                                    <h4>Operation: {effect.operation}</h4>
                                </Col>
                                <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <Button danger onClick={() => handleDeleteConfiguration(effect._id)}>
                                        Delete
                                    </Button>
                                </Col>
                            </Row>
                        </Panel>
                    ))}
                </Collapse>
                <h3 style={{ marginTop: 20 }}>Add or Update Configuration</h3>
                <Form form={formConfig} layout="vertical" onFinish={handleConfigureEvent}>
                    <Form.Item
                        label="Account"
                        name="accountId"
                        rules={[{ required: true, message: "Please select an account!" }]}
                    >
                        <Select placeholder="Select an account">
                            {accounts.map((account) => (
                                <Option key={account._id} value={account._id}>{account.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Amount Field"
                        name="amountField"
                        rules={[{ required: true, message: "Please input the amount field!" }]}
                    >
                        <Select placeholder="Select a field">
                            {/* Replace with number field in the current event parameters read from the ABI by its name */
                                currentContract !== null && currentEvent !== null ? (currentContract.contract_abi
                                    .filter((field) => field.type === "event" && field.name === currentEvent.name)[0].inputs
                                    .filter((input) => input.type === "uint256")
                                    .map((input) => (<Option key={input.name} value={input.name}>{input.name}</Option>))) : null
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Operation"
                        name="operation"
                        rules={[{ required: true, message: "Please select an operation!" }]}
                    >
                        <Select placeholder="Select an operation">
                            <Option value="debit">Debit</Option>
                            <Option value="credit">Credit</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Save Configuration
                            </Button>
                            <Button onClick={handleConfigCancel}>Cancel</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default App;
