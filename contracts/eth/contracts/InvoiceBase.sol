// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract InvoiceBase {
    // Defining the Invoice struct
    struct Invoice {
        uint256 id;
        uint256 orderId;
        uint256 amount;
        bool isPaid;
    }

    // Mapping to store invoices with their IDs
    mapping(uint256 => Invoice) public invoices;

    // Invoice ID counter
    uint256 public invoiceIdCounter;

    // Events
    event InvoiceCreated(uint256 invoiceId, uint256 orderId);
    event InvoicePaid(uint256 invoiceId);

    // Function to create an invoice
    function _createInvoice(uint256 _orderId, uint256 _amount) internal {
        invoiceIdCounter++;

        invoices[invoiceIdCounter] = Invoice({
            id: invoiceIdCounter,
            orderId: _orderId,
            amount: _amount,
            isPaid: false
        });

        emit InvoiceCreated(invoiceIdCounter, _orderId);
    }

    // Function to pay an invoice
    function _payInvoice(uint256 _invoiceId, address payable _recipient, uint256 _value) internal {
        Invoice storage invoice = invoices[_invoiceId];

        require(_value == invoice.amount, "Payment amount must match the invoice amount.");
        require(!invoice.isPaid, "Invoice is already paid.");

        invoice.isPaid = true;
        _recipient.transfer(_value * 10 ** 18);

        console.log("Recipient %s received %d ETH for invoice %d", _recipient, _value, _invoiceId);

        emit InvoicePaid(_invoiceId);
    }
}
