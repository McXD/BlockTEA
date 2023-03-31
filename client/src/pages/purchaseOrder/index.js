import OrderList  from "./OrderList";

const App = () => {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    return (
        <div>
            <h1> Buyer </h1>
            <OrderList contractAddress={contractAddress} role="buyer"/>

            <h1> Seller </h1>
            <OrderList contractAddress={contractAddress} role="seller"/>
        </div>
    );
}

export default App;