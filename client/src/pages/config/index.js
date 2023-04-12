import React, {useState, useEffect, useContext} from 'react';
import {
    Button,
    Table,
    Form,
    Select,
    Popconfirm,
    message,
    Modal,
} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import axios from 'axios';
import {PartyContext} from '../../context/partyContext';
import config from '../../config';


const {Option} = Select;
const eventSchemas = require('./eventSchemas.json')
const baseUrl = config.configApiUrl;

const ConfigurationManager = () => {
    const [configurations, setConfigurations] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(Object.keys(eventSchemas)[0]);
    const [numberFields, setNumberFields] = useState(
        Object.entries(eventSchemas[selectedEvent])
            .filter(([_, fieldType]) => fieldType === 'number')
            .map(([fieldName, _]) => fieldName)
    );
    const [selectedDebitAccount, setSelectedDebitAccount] = useState(null);
    const [selectedCreditAccount, setSelectedCreditAccount] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const {state} = useContext(PartyContext);
    const {partyParameters} = state;
    const vendor = partyParameters.aisProvider.id;

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        // Fetch debit and credit accounts from API
        const fetchAccounts = async () => {
            try {
                const response = await fetch(`${baseUrl}/accounts/${vendor}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const accounts = await response.json();
                if (vendor === 'quickbooks') {
                    accounts.forEach((account) => {
                        account.id = account.Id;
                        account.display_name = account.Name;
                    });
                }

                console.log(accounts)
                setAccounts(accounts);
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
        };


        fetchConfigurations();
        fetchAccounts();
    }, [vendor]);

    const handleEventChange = (value) => {
        setSelectedEvent(value);
        setNumberFields(
            Object.entries(eventSchemas[value])
                .filter(([_, fieldType]) => fieldType === 'number')
                .map(([fieldName, _]) => fieldName)
        );
    };


    const fetchConfigurations = async () => {
        try {
            const response = await axios.get(`${baseUrl}/configurations`);
            setConfigurations(response.data);
            console.log(response.data)
        } catch (error) {
            message.error('Error fetching configurations');
        }
    };

    const addConfiguration = async (configuration) => {
        const configurationWithAccounts = {
            ...configuration,
            debitAccount: selectedDebitAccount,
            creditAccount: selectedCreditAccount,
        };

        try {
            const response = await axios.post(`${baseUrl}/configurations/${vendor}`, configurationWithAccounts);
            setConfigurations([...configurations, response.data]);
            message.success('Configuration added successfully');
        } catch (error) {
            message.error('Error adding configuration');
        }
    };

    const deleteConfiguration = async (id) => {
        try {
            await axios.delete(`${baseUrl}/configurations/${id}`);
            setConfigurations(configurations.filter((conf) => conf._id !== id));
            message.success('Configuration deleted successfully');
        } catch (error) {
            message.error('Error deleting configuration');
        }
    };

    // Dropdown menus
    const eventMenu = (
        <Select placeholder="Select an event" onChange={handleEventChange}>
            {Object.keys(eventSchemas).map((event, index) => (
                <Option key={index} value={event}>
                    {event}
                </Option>
            ))}
        </Select>
    );

    const debitAccountMenu = (
        <Select
            showSearch
            style={{minWidth: '100%'}}
            placeholder="Select a debit account"
            optionFilterProp="children"
            filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => {
                const account = accounts.find((account) => account.id === value);
                setSelectedDebitAccount(account);
            }}
        >
            {accounts.map((account) => (
                <Option key={account.id} value={account.id}>
                    {account.display_name}
                </Option>
            ))}
        </Select>
    );

    const creditAccountMenu = (
        <Select
            showSearch
            style={{minWidth: '100%'}}
            placeholder="Select a credit account"
            optionFilterProp="children"
            filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => {
                const account = accounts.find((account) => account.id === value);
                setSelectedCreditAccount(account);
            }}
        >
            {accounts.map((account) => (
                <Option key={account.id} value={account.id}>
                    {account.display_name}
                </Option>
            ))}
        </Select>
    );


    const amountFieldMenu = (
        <Select placeholder="Select a field">
            {numberFields.map((attribute, index) => (
                <Option key={index} value={attribute}>
                    {attribute}
                </Option>
            ))}
        </Select>
    );

    // Table columns
    const columns = [
        {
            title: 'Event',
            dataIndex: 'event',
            key: 'event',
        },
        {
            title: 'Debit Account',
            dataIndex: 'debitAccount',
            key: 'debitAccount',
            render: (account) => account.display_name,
        },
        {
            title: 'Credit Account',
            dataIndex: 'creditAccount',
            key: 'creditAccount',
            render: (account) => account.display_name,
        },
        {
            title: 'Amount Field',
            dataIndex: 'amountField',
            key: 'amountField',
            // code font
            render: (text) => <code>{text}</code>,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <Popconfirm
                    title="Are you sure you want to delete this configuration?"
                    onConfirm={() => deleteConfiguration(record._id)}
                >
                    <Button type="link" danger>
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div>
            <Modal
                title="Add Configuration"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    onFinish={addConfiguration}
                    layout="horizontal"
                    labelAlign={'left'}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                >
                    <Form.Item
                        name="event"
                        label="Event"
                        rules={[{ required: true, message: 'Please select an event' }]}
                    >
                        {eventMenu}
                    </Form.Item>
                    <Form.Item
                        name="amountField"
                        label="Amount Field"
                        rules={[{ required: true, message: 'Please select an amount field' }]}
                    >
                        {amountFieldMenu}
                    </Form.Item>
                    <Form.Item
                        name="creditAccount"
                        label="Credit Account"
                        rules={[{ required: true, message: 'Please select a credit account' }]}
                    >
                        {creditAccountMenu}
                    </Form.Item>
                    <Form.Item
                        name="debitAccount"
                        label="Debit Account"
                        rules={[{ required: true, message: 'Please select a debit account' }]}
                    >
                        {debitAccountMenu}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Add Configuration
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Table dataSource={configurations.filter((conf) => conf.vendor === vendor)} columns={columns}/>
            <Button type="primary" onClick={showModal} style={{marginTop: 16}} icon={<PlusOutlined/>}/>
        </div>
    );

};

export default ConfigurationManager;
