import React, { useState, useEffect } from 'react';
import { Descriptions, message } from 'antd';
import { useParams } from 'react-router-dom';
import { readAsset } from './apiService';

const AssetDetails = () => {
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        const fetchAsset = async () => {
            setLoading(true);
            try {
                const data = await readAsset(id);
                console.log(data)
                setAsset(data);
            } catch (error) {
                message.error('Error fetching asset details');
            } finally {
                setLoading(false);
            }
        };

        fetchAsset();
    }, [id]);

    if (!asset) {
        return null;
    }

    return (
        <Descriptions title="Asset Details" bordered loading={loading}>
            <Descriptions.Item label="Asset ID">{asset.ID}</Descriptions.Item>
            <Descriptions.Item label="Color">{asset.color}</Descriptions.Item>
            <Descriptions.Item label="Size">{asset.Size}</Descriptions.Item>
            <Descriptions.Item label="Owner">{asset.Owner}</Descriptions.Item>
            <Descriptions.Item label="Value">{asset.AppraisedValue}</Descriptions.Item>
        </Descriptions>
    );
};

export default AssetDetails;
