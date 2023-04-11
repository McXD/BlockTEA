import OrderList  from "./OrderList";
import { PartyContext } from "../../context/partyContext";
import {useContext} from "react";

const App = () => {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    const { state } = useContext(PartyContext);
    const { partyParameters } = state;
    return (
        <div>
            <h1> {partyParameters.name + " as "  + partyParameters.poRole} </h1>
            <OrderList contractAddress={contractAddress} role={partyParameters.poRole}/>
        </div>
    );
}

export default App;