import { Button, Space, Table } from "antd";

const items = [
    {
        key: "1",
        label: "Action 1",
    },
    {
        key: "2",
        label: "Action 2",
    },
];

const App = () => {
    const expandedRowRender = () => {
        const columns = [
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Detail", dataIndex: "detail", key: "detail" },
            { title: "Parameters", dataIndex: "parameters", key: "parameters" },
            {
                title: "Action",
                key: "operation",
                render: () => (
                    <Space size="middle">
                        <a>Edit</a>
                        <a>Delete</a>
                        <a>Configure</a>
                    </Space>
                ),
            },
        ];

        const data = [];
        for (let i = 0; i < 3; ++i) {
            data.push({
                key: i.toString(),
                name: "Event " + (i + 1),
                detail: "Event detail " + (i + 1),
                parameters: "Param1, Param2, Param3",
            });
        }
        return <Table columns={columns} dataSource={data} pagination={false} />;
    };

    const columns = [
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Address", dataIndex: "address", key: "address" },
        { title: "Detail", dataIndex: "detail", key: "detail" },
        { title: "Owner", dataIndex: "owner", key: "owner" },
        {
            title: "Deployment Date",
            dataIndex: "deploymentDate",
            key: "deploymentDate",
        },
        {
            title: "Action",
            key: "operation",
            render: () => (
                <Space size="middle">
                    <a>Add Event</a>
                    <a>Edit</a>
                    <a>Delete</a>
                </Space>
            ),
        },
    ];

    const data = [];
    for (let i = 0; i < 3; ++i) {
        data.push({
            key: i.toString(),
            name: "Contract " + (i + 1),
            address: "0x" + (i + 1),
            detail: "Contract detail " + (i + 1),
            owner: "0xOwner" + (i + 1),
            deploymentDate: "2022-01-01",
        });
    }

    return (
        <>
            <h1>Smart Contracts</h1>
            <Table
                columns={columns}
                expandable={{
                    expandedRowRender,
                    defaultExpandedRowKeys: ["0"],
                }}
                dataSource={data}
                size="small"
            />
            <Button
                type="primary"
                style={{ marginTop: 16 }}
            >
                Add Contract
            </Button>
        </>
    );
};

export default App;
