// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EnterpriseInvoice is AccessControl {
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");

    event InvoiceCreated(uint256 indexed invoiceId, address indexed seller, uint256 amount, string description, uint256 timestamp);
    event InvoicePaid(uint256 indexed invoiceId, address indexed seller, uint256 amount, uint256 timestamp, bytes32 offChainPaymentTxHash);
    event SellerAdded(address indexed seller);
    event SellerRemoved(address indexed seller);

    struct Invoice {
        uint256 id;
        address seller;
        uint256 amount;
        string description;
        bool paid;
        uint256 timestamp;
    }

    Invoice[] public invoices;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createInvoice(uint256 amount, string memory description) public onlyRole(SELLER_ROLE) returns (uint256) {
        uint256 newInvoiceId = invoices.length;
        Invoice memory newInvoice = Invoice(newInvoiceId, msg.sender, amount, description, false, block.timestamp);
        invoices.push(newInvoice);

        emit InvoiceCreated(newInvoiceId, msg.sender, amount, description, block.timestamp);
        return newInvoiceId;
    }

    function payInvoice(uint256 invoiceId, bytes32 offChainPaymentTxHash) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(invoiceId < invoices.length, "Invoice does not exist");
        Invoice storage invoice = invoices[invoiceId];
        require(!invoice.paid, "Invoice already paid");

        invoice.paid = true;
        emit InvoicePaid(invoiceId, invoice.seller, invoice.amount, block.timestamp, offChainPaymentTxHash);
    }

    function addSeller(address seller) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(SELLER_ROLE, seller);
        emit SellerAdded(seller);
    }

    function removeSeller(address seller) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(SELLER_ROLE, seller);
        emit SellerRemoved(seller);
    }

    function getInvoice(uint256 invoiceId) public view returns (Invoice memory) {
        require(invoiceId < invoices.length, "Invoice does not exist");
        return invoices[invoiceId];
    }

    function getInvoiceCount() public view returns (uint256) {
        return invoices.length;
    }
}
