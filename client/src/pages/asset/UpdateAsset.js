import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { readAsset, updateAsset } from './apiService';

const UpdateAsset = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAsset = async () => {
            setLoading(true);
            try {
                const asset = await readAsset(id);
                console.log(asset)
                form.setFieldsValue(asset);
            } catch (error) {
                message.error('Error fetching asset details');
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, [id, form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log("values", values)
            await updateAsset(id, values);
            message.success('Asset updated successfully');
            navigate('..');
        } catch (error) {
            message.error('Error updating asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Asset ID" name="ID" required>
                <Input disabled />
            </Form.Item>
            <Form.Item label="Asset Color" name="Color" required>
                <Input />
            </Form.Item>
            <Form.Item label="Asset Size" name="Size" required>
                <Input />
            </Form.Item>
            <Form.Item label="Asset Owner" name="Owner" required>
                <Input />
            </Form.Item>
            <Form.Item label="Appraised Value" name="AppraisedValue" required>
                <Input />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Update Asset
                </Button>
            </Form.Item>
        </Form>
    );
};

export default UpdateAsset;
