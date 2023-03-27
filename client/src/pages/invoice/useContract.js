import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import Web3 from "web3";
import EnterpriseInvoiceABI from "../../contracts/ABI/EnterpriseInvoice.json";
import contractAddress from "../../contracts/deployments/EnterpriseInvoice.json";

const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 31337],
});

const useContract = () => {
  const [contract, setContract] = useState(null);
  const { activate, active, library, account } = useWeb3React();

  useEffect(() => {
    const connectToContract = async () => {
      console.log("Connecting to contract...")
      console.log("Active: ", active);
      if (!active) {
        try {
          await activate(injectedConnector);
        } catch (error) {
          console.log("Error activating connector", error);
        }
      }

      if (library && account) {
        const contractInstance = new library.eth.Contract(
          EnterpriseInvoiceABI.abi,
          contractAddress.address
        ); // Replace with your contract address
        setContract(contractInstance);
      }
    };

    connectToContract();
  }, [active, activate, library, account]);

  const addSeller = async (seller) => {
    if (!contract || !account || !active) return;
    try {
      await contract.methods.addSeller(seller).send({ from: account });
      console.log("Seller added: ", seller);
    } catch (error) {
      console.log("Error adding seller:", error);
    }
  };

  const removeSeller = async (seller) => {
    if (!contract || !account) return;
    try {
      await contract.methods.removeSeller(seller).send({ from: account });
    } catch (error) {
      console.log("Error removing seller:", error);
    }
  };

  const createInvoice = async (amount, description) => {
    if (!contract || !account) return;
    try {
      await contract.methods.createInvoice(amount, description).send({ from: account });
    } catch (error) {
      console.log("Error creating invoice:", error);
    }
  };

  const payInvoice = async (invoiceId, offChainPaymentTxHash) => {
    if (!contract || !account) return;
    try {
      await contract.methods
        .payInvoice(invoiceId, offChainPaymentTxHash)
        .send({ from: account });
    } catch (error) {
      console.log("Error paying invoice:", error);
    }
  };

  return {
    contract,
    addSeller,
    removeSeller,
    createInvoice,
    payInvoice,
  };
};

export default useContract;