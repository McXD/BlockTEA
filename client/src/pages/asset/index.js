import React from 'react';
import { Layout, Menu } from 'antd';
import { Route, Routes } from 'react-router-dom';
import CreateAsset from './CreateAsset';
import TransferAsset from './TransferAsset';
import AssetList from './AssetList';
import AssetDetails from './AssetDetails';
import UpdateAsset from './UpdateAsset';

const { Header, Content } = Layout;


const AssetTransfer = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<AssetList />} index />
                <Route path="/create-asset" element={<CreateAsset />} />
                <Route path="/transfer-asset" element={<TransferAsset />} />
                <Route path="/asset-details/:id" element={<AssetDetails />} />
                <Route path="/update-asset/:id" element={<UpdateAsset />} />
            </Routes>
        </div>
    );
};

export default AssetTransfer;