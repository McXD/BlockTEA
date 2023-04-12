import React, { useState, useContext } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { createAsset } from './apiService';
import { PartyContext } from '../../context/partyContext';

const CreateAssetModal = ({onAssetCreated}) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { state } = useContext(PartyContext);
    const { partyParameters } = state;
    const baseUrl = partyParameters.fabricApiUrl;

// CreateAssetModal.js
    const onFinish = async (values) => {
        setLoading(true);
        try {
            await createAsset(baseUrl, values);
            message.success('Asset created successfully');
            setVisible(false);

            onAssetCreated({
                Record: {
                    ID: values.assetID,
                    Color: values.color,
                    Size: values.size,
                    Owner: values.owner,
                    AppraisedValue: values.appraisedValue
                },
            }); // Call the callback function passed down from the parent component
        } catch (error) {
            console.log(error);
            message.error('Error creating asset');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Button type="primary" onClick={() => setVisible(true)}>
                Create Asset
            </Button>
            <Modal
                title="Create Asset"
                visible={visible}
                onCancel={() => setVisible(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Asset ID" name="assetID" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Asset Color" name="color" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Asset Size" name="size" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Asset Owner" name="owner" required>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Appraised Value" name="appraisedValue" required>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Create Asset
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CreateAssetModal;
