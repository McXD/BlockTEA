import { FileOutlined, PieChartOutlined, UserOutlined, ContainerOutlined, AuditOutlined, LinkOutlined, LineChartOutlined } from '@ant-design/icons';
import {Breadcrumb, Layout, Menu, Switch, Typography} from 'antd';
import React, { useState } from 'react';
import { ReactComponent as EthereumIcon } from './assets/ethereum-logo.svg';
import FabricIcon from './assets/hyperledger-logo.svg';
import CordaIcon from './assets/corda-logo.png';
import PurchaseOrder from "./pages/purchaseOrder";
import AssetTransfer from "./pages/asset";
import EventStream from "./pages/event";


const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('4');


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
                        <Menu.Item key="5">Odoo</Menu.Item>
                        <Menu.Item key="6">QuickBook</Menu.Item>
                        <Menu.Item key="7">BlockTEA SubLedger</Menu.Item>
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
                      {selectedKey === '4' && <h1 style={{ color: 'white' }}>Blockchain Events</h1>}

                      {/* Add more titles for other selectedKeys */}
                    </span>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    {selectedKey === '1' && <PurchaseOrder />}
                    {selectedKey === '2' && <AssetTransfer />}
                    {/*{selectedKey === '3' && <IOU />}*/}
                    {/*{selectedKey === '5' && <Odoo />}*/}
                    {/*{selectedKey === '6' && <QuickBook />}*/}
                    {/*{selectedKey === '7' && <BlockTEASubLedger />}*/}
                    {selectedKey === '4' && <EventStream />}
                </Content>
                <Footer style={{ textAlign: 'center' }}>Your Company Name ©2023 Created by Your Team</Footer>
            </Layout>
        </Layout>
    );
};

export default App;
