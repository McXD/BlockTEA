import React, {useState, useEffect, useContext} from 'react';
import { Button, Input, Table, message, Tabs, Select } from 'antd';
import axios from 'axios';
import { PartyContext } from "../../context/partyContext";

const { TabPane } = Tabs;
const { Option } = Select;


const IOUApp = () => {
    const [ious, setIous] = useState([]);
    const [amount, setAmount] = useState(0);
    const [settlementAmount, setSettlementAmount] = useState(0);
    const [selectedIOU, setSelectedIOU] = useState(null);
    const [borrower, setBorrower] = useState(null);
    const { state } = useContext(PartyContext)
    const { partyParameters } = state
    const ourIdentity = partyParameters.cordaIdentity
    const API_BASE = partyParameters.cordaApiUrl

    const columns = [
        { title: 'Linear ID', dataIndex: 'id', key: 'id' },
        { title: 'Lender', dataIndex: 'lender', key: 'lender' },
        { title: 'Borrower', dataIndex: 'borrower', key: 'borrower' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount' },
        { title: 'Paid Amount', dataIndex: 'paidAmount', key: 'paidAmount' },
    ];

    useEffect(() => {
        fetchIous();
        console.log("ious: " + ious)
        console.log(ious[0])
    }, [state]);

    const fetchIous = async () => {
        try {
            const response = await axios.get(`${API_BASE}/iou`, { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
            setIous(response.data);
        } catch (error) {
            message.error('Error fetching IOUs');
        }
    };

    const issueIou = async () => {
        if (!borrower) {
            message.error('Select a borrower');
            return;
        }
        try {
            console.log("lender: " + borrower)
            console.log(encodeURIComponent(borrower))

            await axios.post(
                `${API_BASE}/iou/issue/${borrower}/${amount}`,
                {},
                { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
            );
            message.success('IOU issued successfully');
            fetchIous();
        } catch (error) {
            message.error('Error issuing IOU');
        }
    };

    const settleIou = async () => {
        if (!selectedIOU) {
            message.error('Select an IOU to settle');
            return;
        }
        try {
            await axios.post(
                `${API_BASE}/iou/settle/${selectedIOU}/${settlementAmount}`,
                {},
                { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
            );
            message.success('IOU settled successfully');
            fetchIous();
            setSelectedIOU(null)
        } catch (error) {
            message.error('Error settling IOU');
        }
    };

    const onLenderChange = (value) => {
        setBorrower(value);
    };

    return (
        <div>
            <h1> {`${partyParameters.name} As ${partyParameters.cordaIdentity}`} </h1>
            <Tabs style={{ marginBottom: 16 }}>
                <TabPane tab="As Lender" key="1">
                    <Table
                        columns={columns.filter(column => column.title !== 'Lender')}
                        dataSource={ious.filter(iou => iou.lender === ourIdentity)}
                        rowKey="id"
                    />
                    <div style={{ marginBottom: 16 }}>
                        <Select
                            style={{ width: 200, marginRight: 16 }}
                            placeholder="Select Borrower"
                            onChange={onLenderChange}
                        >
                            {
                                state.currentParty === "partyA" ? (
                                    <Option value="O=PartyB,L=New York,C=US">GreenSolutions Ltd.</Option>
                                ) : (
                                    <Option value="O=PartyA,L=London,C=GB">BlueTech Ltd.</Option>
                                )
                            }
                        </Select>
                        <Input
                            placeholder="Amount"
                            style={{ width: 200, marginRight: 16 }}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <Button type="primary" onClick={issueIou} style={{marginTop: "18px"}}>
                            Issue IOU
                        </Button>
                    </div>
                </TabPane>
                <TabPane tab="As Borrower" key="2">
                    <Table
                        rowSelection={{
                            type: 'highlight',
                            onChange: (selectedRowKeys, selectedRows) => {
                                if (selectedRows.length > 0) {
                                    setSelectedIOU(selectedRows[0].id);
                                } else {
                                    setSelectedIOU(null);
                                }
                            },
                        }}
                        columns={columns.filter(column => column.title !== 'Borrower')}
                        dataSource={ious.filter(iou => iou.borrower === ourIdentity)} rowKey="id" />
                </TabPane>
            </Tabs>
            {
                selectedIOU && (
                    <div style={{ marginBottom: 16 }}>
                        <Input
                            placeholder="Settlement Amount"
                            style={{ width: 200, marginRight: 16 }}
                            onChange={(e) => setSettlementAmount(e.target.value)}
                        />
                        <Button type="primary" onClick={settleIou}>
                            Settle IOU
                        </Button>
                    </div>
                )
            }
        </div>
    );


};

export default IOUApp;

