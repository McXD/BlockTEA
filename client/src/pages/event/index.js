import React, {useEffect, useState} from "react";
import {Table} from "antd";
import "./event.css";
import ReactJson from 'react-json-view';

const App = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8081");

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
    }, []);

    const columns = [
        {
            title: "ID",
            dataIndex: "_id",
            key: "_id",
            render: (_id) => _id.substring(0, 10) + "..."
        },
        {
            title: "Origin",
            dataIndex: "origin",
            key: "origin",
        },
        {
            title: "Transaction ID",
            dataIndex: "transactionId",
            key: "transactionId",
            render: (transactionId) => (transactionId.substring(0, 10) + "...")
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Contract",
            dataIndex: "contract",
            key: "contract",
            render: (contract) => <ReactJson src={contract} collapsed={true} />,

        },
        {
            title: "Payload",
            dataIndex: "payload",
            key: "payload",
            render: (payload) => <ReactJson src={payload} collapsed={true} />,
        },
    ];


    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey={"_id"}
            pagination={false}
            bordered
            className="animated-table"
            style={{width: "100%", fontFamily: "monospace"}}
        />
    );
};

export default App;