import { createContext, useReducer } from 'react';
import config from '../config';

const PartyContext = createContext();

const partyReducer = (state, action) => {
    switch (action.type) {
        case 'SWITCH_PARTY':
            return {
                ...state,
                currentParty: action.party,
                partyParameters: action.parameters,
            };
        default:
            return state;
    }
};

const PartyProvider = ({ children }) => {
    const initialState = {
        currentParty: 'partyA',
        partyParameters: config.partyA,
    };

    const [state, dispatch] = useReducer(partyReducer, initialState);

    return (
        <PartyContext.Provider value={{ state, dispatch }}>
            {children}
        </PartyContext.Provider>
    );
};

export { PartyContext, PartyProvider };
