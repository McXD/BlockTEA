import OrderList  from "./OrderList";

const App = () => {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    return (
        <div>
            <h1> App Purchase Order </h1>
            <h2> Address: {contractAddress} </h2>
            <h2> Owner/Buyer: {window.ethereum.selectedAddress} </h2>
            <OrderList contractAddress={contractAddress} role="buyer"/>
        </div>
    );
}

export default App;