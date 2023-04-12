import React, {useContext, useEffect, useState} from "react";
import {Table} from "antd";
import "./event.css";
import ReactJson from 'react-json-view';
import { CopyOutlined } from "@ant-design/icons";
import { message } from "antd";
import config from "../../config";
import {PartyContext} from "../../context/partyContext";

const App = () => {
    const [data, setData] = useState([]);
    const  { state } = useContext(PartyContext)
    const  { partyParameters } = state

    useEffect(() => {
        const socket = new WebSocket(config.wsUrl);

        socket.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            console.log("Received data:", newData)

            setData((prevData) => {
                // Check if the data already exists based on a unique property (e.g., _id)
                const dataExists = prevData.some((item) => item._id === newData._id);

                if (!dataExists) {
                    // If data doesn't exist, add it to the state
                    return [...prevData, newData];
                } else {
                    // If data already exists, return the previous state without changes
                    return prevData;
                }
            });
        };

        socket.addEventListener("open", (event) => {
            console.log("WebSocket connection established:", event);
        });


        socket.addEventListener("close", (event) => {
            console.log("WebSocket connection closed:", event);
        });

        socket.addEventListener("error", (event) => {
            console.log("WebSocket error:", event);
        });


        return () => {
            socket.close();
        };
    }, [state]);

    const columns = [
        {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            sorter: (a, b) => a.timestamp - b.timestamp,
            render: (timestamp) => new Date(timestamp * 1000).toLocaleString(),
            defaultSortOrder: "descend",
        },
        // {
        //     title: "ID",
        //     dataIndex: "_id",
        //     key: "_id",
        //     render: (_id) => '...' + _id.substring(_id.length - 10, _id.length)
        // },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Origin",
            dataIndex: "origin",
            key: "origin",
            sorter: (a, b) => a.origin.localeCompare(b.origin),
            render: (origin) => origin.toUpperCase(),
            filters: [
                {text: "Ethereum", value: "ethereum"},
                {text: "Hyperledger", value: "hyperledger"},
                {text: "Corda", value: "corda"},
                // Add more origins as needed
            ],
            onFilter: (value, record) => record.origin === value,
        },
        {
            title: "Transaction ID",
            dataIndex: "transactionId",
            key: "transactionId",
            render: (transactionId) => (
                <div style={{ display: "flex", alignItems: "center", fontFamily: "monospace" }}>
                    <span>{transactionId.substring(0, 10) + "..."}</span>
                    <CopyOutlined
                        style={{ marginLeft: 8, cursor: "pointer" }}
                        onClick={() => {
                            navigator.clipboard.writeText(transactionId).then(
                                () => {
                                    message.success("Transaction ID copied to clipboard");
                                    console.log("Transaction ID copied to clipboard");
                                },
                                (err) => {
                                    console.error("Could not copy text:", err);
                                }
                            );
                        }}
                    />
                </div>
            ),
        },

        {
            title: "Journal Entry",
            dataIndex: "journalEntry",
            key: "journalEntry",
            render: (_, record) => {
                const journalEntry = record[partyParameters.aisProvider.id];
                if (journalEntry === undefined) {
                    return <span>N/A</span>;
                }

                const url = partyParameters.aisProvider.journalUrlTemplate.replace('{id}', journalEntry);
                return <a href={url} target="_blank"> {journalEntry} </a>
            },
        },


        {
            title: "Contract",
            dataIndex: "contract",
            key: "contract",
            render: (contract) => <ReactJson
                src={contract}
                collapsed={true}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
            />,

        },
        {
            title: "Payload",
            dataIndex: "payload",
            key: "payload",
            render: (payload) => <ReactJson
                src={payload}
                collapsed={true}
                displayDataTypes={false}
                displayObjectSize={false}
                enableClipboard={false}
            />,
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={data}
                rowKey={"_id"}
                pagination={{
                    defaultPageSize: 20,
                    showSizeChanger: true,
                    pageSizeOptions: ["20", "50", "100"],
                }}
                bordered
                className="animated-table"
                style={{ width: "100%", fontFamily: "monospace" }}
            />
        </>
    );
};

export default App;