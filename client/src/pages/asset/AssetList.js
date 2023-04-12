import React, {useState, useEffect, useContext} from 'react';
import {Table, message, Modal, Form, Input, Button} from 'antd';
import {readAssets, transferAsset, updateAsset} from './apiService';
import { PartyContext } from "../../context/partyContext";
import CreateAsset from "./CreateAsset";

const AssetList = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [transferModalVisible, setTransferModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [currentAsset, setCurrentAsset] = useState(null);
    const [form] = Form.useForm();
    const { state } = useContext(PartyContext);
    const { partyParameters } = state;
    const baseUrl = partyParameters.fabricApiUrl;

    const columns = [
        { title: 'Asset ID', dataIndex: ['Record', 'ID'], key: 'assetId' },
        { title: 'Color', dataIndex: ['Record', 'Color'], key: 'color' },
        { title: 'Size', dataIndex: ['Record', 'Size'], key: 'size' },
        // { title: 'Owner', dataIndex: ['Record', 'Owner'], key: 'owner' },
        { title: 'Value', dataIndex: ['Record', 'AppraisedValue'], key: 'value' },

        {
            title: 'Actions',
            dataIndex: '',
            key: 'actions',
            render: (_, record) => (
                <>
                    <a onClick={() => handleUpdateClick(record)}>Update</a>
                    <span> </span>
                    <a onClick={() => handleTransferClick(record)}>Transfer</a>
                </>
            ),
        },
    ];

    const addAsset = (newAsset) => {
        setAssets((prevAssets) => [...prevAssets, newAsset]);
    };

    const handleUpdateClick = (record) => {
        setCurrentAsset(record);
        form.setFieldsValue(record.Record);
        setUpdateModalVisible(true);
    };

    const handleUpdateSubmit = async (values) => {
        try {
            console.log("values", values)
            await updateAsset(baseUrl, currentAsset.ID, values);
            message.success('Asset updated successfully');
            currentAsset.Record = values;
            setAssets([...assets]);
            setUpdateModalVisible(false);
        } catch (error) {
            message.error('Error updating asset');
        }
    };

    const handleTransferClick = (record) => {
        setCurrentAsset(record);
        setTransferModalVisible(true);
    };

    const handleTransferSubmit = async (values) => {
        try {
            await transferAsset(baseUrl, currentAsset.Record.ID, values.newOwner);
            message.success('Asset transferred successfully');
            currentAsset.Record.Owner = values.newOwner;
            setAssets([...assets]);
            setTransferModalVisible(false);
        } catch (error) {
            message.error('Error transferring asset');
        }
    };

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const data = await readAssets(baseUrl);
                console.log(data)
                setAssets(data);
            } catch (error) {
                message.error('Error fetching assets');
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    return (
        <>
            <h1> {partyParameters.name + " As " + partyParameters.fabricOrg} </h1>
            <Table
                columns={columns}
                dataSource={
                assets.filter(asset => asset.Record.Owner === partyParameters.fabricOrg)
            }
                rowKey="assetId"
                loading={loading}
                style={{ marginBottom: 16 }}
            />
            <CreateAsset onAssetCreated={addAsset}/>
            <Modal
                title={`Transfer Asset: ${currentAsset ? currentAsset.Record.ID : ''}`}
                visible={transferModalVisible}
                onCancel={() => setTransferModalVisible(false)}
                onOk={() => {
                    form
                        .validateFields()
                        .then((values) => {
                            form.resetFields();
                            handleTransferSubmit(values);
                        })
                        .catch((info) => {
                            console.log('Validation Failed:', info);
                        });
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="New Owner"
                        name="newOwner"
                        rules={[
                            {
                                required: true,
                                message: 'Please enter the new owner',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={`Update Asset: ${currentAsset ? currentAsset.Record.ID : ''}`}
                visible={updateModalVisible}
                onCancel={() => setUpdateModalVisible(false)}
                onOk={() => {
                    form
                        .validateFields()
                        .then((values) => {
                            form.resetFields();
                            handleUpdateSubmit(values);
                        })
                        .catch((info) => {
                            console.log('Validation Failed:', info);
                        });
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Asset ID" name="ID" required>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Asset Owner" name="Owner" required>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Asset Color" name="Color" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Asset Size" name="Size" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Appraised Value" name="AppraisedValue" required>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AssetList;
