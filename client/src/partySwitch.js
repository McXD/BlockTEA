import React, {useContext} from "react";
import {PartyContext} from "./context/partyContext";
import config from "./config";
import {Switch} from "antd";

const PartySwitch = () => {
    const { state, dispatch } = useContext(PartyContext);

    const onSwitchChange = (checked) => {
        const party = checked ? 'partyB' : 'partyA';
        const parameters = config[party];
        console.log("Switching to party: " + party + " with parameters: " + JSON.stringify(parameters) + ".");
        dispatch({ type: 'SWITCH_PARTY', party, parameters });
    };

    return (
        <Switch
            checked={state.currentParty === 'partyB'}
            onChange={onSwitchChange}
            checkedChildren="GreenSolutions Inc."
            unCheckedChildren="BlueTech Ltd."
        />
    );
};

export default PartySwitch;