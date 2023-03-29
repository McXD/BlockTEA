import {Button, Table, Form, Input, Select, Modal} from "antd";
import {useState, useEffect} from "react";
import config from "../../config";

const {Option} = Select;

const App = () => {
    const [accounts, setAccounts] = useState([]);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchData = async () => {
        const accountsResponse = await fetch(`${config.apiBaseUrl}/api/ledger/accounts`);
        const accountsData = await accountsResponse.json();

        const accountsWithJournalEntries = await Promise.all(
            accountsData.map(async (account) => {
                const journalEntriesResponse = await fetch(
                    `${config.apiBaseUrl}/api/ledger/accounts/${account._id}/journalEntries`
                );
                const journalEntriesData = await journalEntriesResponse.json();

                const journalEntriesWithEvents = await Promise.all(
                    journalEntriesData.map(async (entry) => {
                        const eventResponse = await fetch(`${config.apiBaseUrl}/api/ledger/events/${entry.event_id}`);
                        const eventData = await eventResponse.json();
                        return {...entry, event: eventData};
                    })
                );

                return {...account, entries: journalEntriesWithEvents};
            })
        );

        console.log(accountsWithJournalEntries)
        setAccounts(accountsWithJournalEntries);
    };

    useEffect(() => {
        fetchData().then(r => console.log("Accounts fetched"));
    }, []);

    const expandedRowRender = (record) => {
        const columns = [
            {title: "Event ID", dataIndex: "event_id", key: "eventId"},
            {title: "Event Name", dataIndex: ["event", "name"], key: "eventName"},
            {
                title: "Transaction Hash",
                dataIndex: ["event", "transaction_hash"],
                key: "transactionHash",
            },
            {title: "Entry Type", dataIndex: "entry_type", key: "entry_type"},
            {title: "Amount", dataIndex: "amount", key: "amount"},
        ];

        return (
            <Table
                columns={columns}
                dataSource={record.entries}
                pagination={false}
                size="small"
            />
        );
    };

    const columns = [
        {title: "Account ID", dataIndex: "_id", key: "id"},
        {title: "Account Name", dataIndex: "name", key: "name"},
        {title: "Account Type", dataIndex: "type", key: "type"},
        {title: "Balance", dataIndex: "balance", key: "balance"},
    ];

    const createAccount = async (values) => {
        const {accountName, accountType} = values;

        const response = await fetch("http://localhost:8000/api/ledger/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name: accountName, type: accountType}),
        });

        const newAccountData = await response.json();
        fetchData(); // Refetch accounts data to display the new account
        form.resetFields(); // Reset form fields
    };

    const onFinish = (values) => {
        createAccount(values).then(r => console.log("Account created"));
        setIsModalVisible(false); // Close the modal after creating the account
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <h1>Ledger</h1>
            <Table
                columns={columns}
                dataSource={accounts}
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.entries.length > 0,
                }}
                size="small"
            />
            <Button type="primary" onClick={showModal} style={{ marginTop: 16 }}>
                Add Account
            </Button>
            <Modal
                title="Create New Account"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="accountName"
                        label="Account Name"
                        rules={[
                            {
                                required: true,
                                message: "Please input the account name!",
                            },
                        ]}
                    >
                        <Input placeholder="Account Name"/>
                    </Form.Item>
                    <Form.Item
                        name="accountType"
                        label="Account Type"
                        rules={[
                            {
                                required: true,
                                message: "Please select the account type!",
                            },
                        ]}
                    >
                        <Select placeholder="Account Type">
                            <Option value="asset">Asset</Option>
                            <Option value="liability">Liability</Option>
                            <Option value="equity">Equity</Option>
                            <Option value="income">Income</Option>
                            <Option value="expense">Expense</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Add Account
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default App;
