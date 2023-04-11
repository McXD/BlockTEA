import React from 'react';
import { Layout, Menu } from 'antd';
import { Route, Routes } from 'react-router-dom';
import CreateAsset from './CreateAsset';
import TransferAsset from './TransferAsset';
import AssetList from './AssetList';
import AssetDetails from './AssetDetails';
import UpdateAsset from './UpdateAsset';
import Asset from "./index";

const { Header, Content } = Layout;


const AssetTransfer = () => {
    return (
        <div>
            <AssetList />
        </div>
    );
};

export default AssetTransfer;