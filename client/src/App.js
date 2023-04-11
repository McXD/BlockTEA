import {
    FileTextFilled,
    BankFilled,
    LinkOutlined,
    AccountBookFilled,
    DashboardFilled,
    SettingFilled,
    GoldFilled,
} from '@ant-design/icons';
import {Layout, Menu, Typography} from 'antd';
import React, {useState} from 'react';
import {ReactComponent as EthereumIcon} from './assets/ethereum-logo.svg';
import FabricIcon from './assets/hyperledger-logo.svg';
import CordaIcon from './assets/corda-logo.png';
import PurchaseOrder from "./pages/purchaseOrder";
import AssetTransfer from "./pages/asset";
import EventStream from "./pages/event";
import IOU from "./pages/iou";
import Configuration from "./pages/config";
import {useContext} from 'react';
import {PartyContext} from './context/partyContext';
import PartySwitch from "./partySwitch";

const {Header, Content, Footer, Sider} = Layout;
const {Title} = Typography;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('8');
    const {state} = useContext(PartyContext);
    const {partyParameters} = state;


    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
                   width={"20%"} theme='light'>
                <Title level={collapsed ? 4 : 2} style={{color: 'black', margin: '16px', textAlign: 'center'}}>
                    BlockTEA Demo
                </Title>
                <Menu theme="light" defaultSelectedKeys={['1']} mode="inline" onClick={({key}) => setSelectedKey(key)}>
                    <Menu.SubMenu key="ethereum" icon={<EthereumIcon style={{width: '1.5em', height: '1.5em'}}/>}
                                  title="Ethereum">
                        <Menu.Item key="1" icon={<FileTextFilled/>}>
                            Purchase Order
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="fabric" icon={<img src={FabricIcon} style={{width: '1.5em', height: '1.5em'}}/>}
                                  title="Hyperledger Fabric">
                        <Menu.Item key="2" icon={<GoldFilled/>}>
                            Asset Transfer
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="corda" icon={<img src={CordaIcon} style={{width: '1.5em', height: '1.5em'}}/>}
                                  title="Corda">
                        <Menu.Item key="3" icon={<BankFilled/>}>
                            IOU
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu key="sub1" icon={<AccountBookFilled style={{width: '1.5em', height: '1.5em'}}/>}
                                  title="Accounting">
                        <Menu.Item key="5" icon={<LinkOutlined/>}>
                            <a href={partyParameters.aisProvider.url} target="_blank" rel="noopener noreferrer">
                                {partyParameters.aisProvider.name}
                            </a>
                        </Menu.Item>
                        <Menu.Item key="8" icon={<SettingFilled/>}> Configuration</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key="4" icon={<DashboardFilled style={{width: '1.5em', height: '1.5em'}}/>}>
                        Event Stream
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header style={{display: "flex", alignItems: "center", justifyItems: "space-between"}}>
                  <span style={{fontSize: "24px", flexGrow: 1}}>
                      {selectedKey === '1' && <h1 style={{color: 'white'}}>Purchase Order</h1>}
                      {selectedKey === '2' && <h1 style={{color: 'white'}}>Asset Transfer</h1>}
                      {selectedKey === '3' && <h1 style={{color: 'white'}}>IOU</h1>}
                      {selectedKey === '4' && <h1 style={{color: 'white'}}>Blockchain Events</h1>}
                      {selectedKey === '8' && <h1 style={{color: 'white'}}>Configuration</h1>}
                      {/* Add more titles for other selectedKeys */}
                    </span>
                    <div>
                        <PartySwitch/>
                    </div>
                </Header>
                <Content style={{margin: '16px 16px'}}>
                    {selectedKey === '1' && <PurchaseOrder/>}
                    {selectedKey === '2' && <AssetTransfer/>}
                    {selectedKey === '3' && <IOU/>}
                    {selectedKey === '4' && <EventStream/>}
                    {selectedKey === '8' && <Configuration/>}
                </Content>
                <Footer style={{textAlign: 'center'}}>
                    BlockTEA Demo Created by <em> Yunlin FENG </em> for the Capstone Project
                </Footer>
            </Layout>
        </Layout>
    );
};

export default App;
