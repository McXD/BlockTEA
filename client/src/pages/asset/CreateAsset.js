import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { createAsset } from './apiService';

const CreateAsset = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await createAsset(values);
            message.success('Asset created successfully');
        } catch (error) {
            message.error('Error creating asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Asset ID" name="assetId" required>
                <Input />
            </Form.Item>
            <Form.Item label="Asset Name" name="assetName" required>
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
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Create Asset
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CreateAsset;
