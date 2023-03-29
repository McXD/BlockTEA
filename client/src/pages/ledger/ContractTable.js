import { useState, useEffect } from "react";
import { Button, Space, Table } from "antd";
import config from "../../config";
import axios from "axios";

const App = () => {
    const [smartContracts, setSmartContracts] = useState([]);

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
            <Button type="primary" style={{ marginTop: 16 }}>
                Add Contract
            </Button>
        </>
    );
};

export default App;
