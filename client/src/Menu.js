import { FileOutlined, PieChartOutlined, UserOutlined, ContainerOutlined, AuditOutlined, LinkOutlined, LineChartOutlined } from '@ant-design/icons';
import {Breadcrumb, Layout, Menu, Switch, Typography} from 'antd';
import React, { useState } from 'react';
import { ReactComponent as EthereumIcon } from './assets/ethereum-logo.svg';
import FabricIcon from './assets/hyperledger-logo.svg';
import CordaIcon from './assets/corda-logo.png';
import PurchaseOrder from "./pages/purchaseOrder";
import AssetTransfer from "./pages/asset";
import EventStream from "./pages/event";
import IOU from "./pages/iou";
import Configuration from "./pages/config";
import {Link} from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('8');


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
                   width={"20%"} theme='light'>
                <Title level={collapsed ? 4 : 2} style={{ color: 'black', margin: '16px', textAlign: 'center' }}>
                    BlockTEA Demo
                </Title>
                <Menu theme="light" defaultSelectedKeys={['1']} mode="inline" onClick={({ key }) => setSelectedKey(key)}>
                    <Menu.SubMenu key="ethereum" icon={<EthereumIcon style={{ width: '1.5em', height: '1.5em' }} />} title="Ethereum" >
                        <Menu.Item key="1" icon={<PieChartOutlined />}>
                            Purchase Order
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="fabric" icon={<img src={FabricIcon} style={{ width: '1.5em', height: '1.5em' }}/>} title="Hyperledger Fabric">
                        <Menu.Item key="2" icon={<ContainerOutlined />}>
                            Asset Transfer (HLF)
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="corda" icon={<img src={CordaIcon} style={{ width: '1.5em', height: '1.5em' }}/>} title="Corda">
                        <Menu.Item key="3" icon={<AuditOutlined />}>
                            IOU
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="sub1" icon={<AuditOutlined style={{ width: '1.5em', height: '1.5em' }}/>} title="Accounting">
                        <Menu.Item key="5" icon={<LinkOutlined style={{ width: '1.5em', height: '1.5em' }}/>}>
                            <a href="http://172.20.73.31:8069/web#action=229&model=account.move.line&view_type=list&cids=1&menu_id=115" target="_blank" rel="noopener noreferrer">
                                Odoo
                            </a>
                        </Menu.Item>
                        <Menu.Item key="6" icon={<LinkOutlined style={{ width: '1.5em', height: '1.5em' }}/>}>
                            <a href="https://app.sandbox.qbo.intuit.com/app/report/builder?rptId=sbg:a9b1d2ed-f82a-48d9-8440-55ad8221265a&type=system&token=JOURNAL" target="_blank" rel="noopener noreferrer">
                                QuickBook
                            </a>
                        </Menu.Item>
                        <Menu.Item key="8">Configuration</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key="4" icon={<LineChartOutlined style={{ width: '1.5em', height: '1.5em' }}/>}>
                        Event Stream
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header style={{display: "flex", alignItems: "center", justifyItems: "space-between"}}>
                  <span style={{fontSize: "24px"}}>
                      {selectedKey === '1' && <h1 style={{ color: 'white' }}>Purchase Order</h1>}
                      {selectedKey === '2' && <h1 style={{ color: 'white' }}>Asset Transfer</h1>}
                      {selectedKey === '3' && <h1 style={{ color: 'white' }}>IOU</h1>}
                      {selectedKey === '4' && <h1 style={{ color: 'white' }}>Blockchain Events</h1>}
                      {selectedKey === '8' && <h1 style={{ color: 'white' }}>Configuration</h1>}
                      {/* Add more titles for other selectedKeys */}
                    </span>
                </Header>
                <Content style={{ margin: '16px 16px' }}>
                    {selectedKey === '1' && <PurchaseOrder />}
                    {selectedKey === '2' && <AssetTransfer />}
                    {selectedKey === '3' && <IOU />}
                    {/*{selectedKey === '5' && <Odoo />}*/}
                    {/*{selectedKey === '6' && <QuickBook />}*/}
                    {/*{selectedKey === '7' && <BlockTEASubLedger />}*/}
                    {selectedKey === '4' && <EventStream />}
                    {selectedKey === '8' && <Configuration />}
                </Content>
                <Footer style={{ textAlign: 'center' }}>Your Company Name ©2023 Created by Your Team</Footer>
            </Layout>
        </Layout>
    );
};

export default App;
