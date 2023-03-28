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
            } catch (error) {
                console.error(error);
            }
        };

        fetchContracts().then(r => console.log(r));
    }, []);

    const expandedRowRender = (record) => {
        const columns = [
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Detail", dataIndex: "detail", key: "detail" },
            { title: "Parameters", dataIndex: "parameters", key: "parameters" },
            {
                title: "Action",
                key: "operation",
                render: () => (
                    <Space size="middle">
                        <a>Configure</a>
                    </Space>
                ),
            },
        ];

        return (
            <Table
                columns={columns}
                dataSource={record.events}
                pagination={false}
                rowKey="name"
            />
        );
    };

    const columns = [
        { title: "Name", dataIndex: "contract_name", key: "contract_name" },
        { title: "Address", dataIndex: "contract_address", key: "contract_address" },
        { title: "Owner", dataIndex: "owner", key: "owner" },
        { title: "ABI", dataIndex: "contract_abi", key: "contract_abi" },
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
