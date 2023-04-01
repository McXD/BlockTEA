import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { transferAsset } from './apiService';

const TransferAsset = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await transferAsset(values);
            message.success('Asset transferred successfully');
        } catch (error) {
            message.error('Error transferring asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Asset ID" name="assetId" required>
                <Input />
            </Form.Item>
            <Form.Item label="New Owner" name="newOwner" required>
                <Input />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Transfer Asset
                </Button>
            </Form.Item>
        </Form>
    );
};

export default TransferAsset;
