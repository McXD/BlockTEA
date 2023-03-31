// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import './InvoiceBase.sol';

contract CollaborativeSalesOrder is InvoiceBase {
    // Defining the Sales Order struct
    struct Order {
        uint256 id;
        address buyer;
        string product;
        uint256 quantity;
        uint256 price;
        bool isOrderConfirmed;
        bool isOrderCompleted;
    }

    // Mapping to store orders with their IDs
    mapping(uint256 => Order) public orders;

    // Order ID and Invoice ID counters
    uint256 private orderIdCounter;

    // Contract owner (seller)
    address public owner;

    // Events
    event NewOrder(uint256 orderId, address indexed buyer, address indexed seller);
    event OrderConfirmed(uint256 orderId);
    event OrderCompleted(uint256 orderId);


    // Modifier to restrict function access only to the contract owner (seller)
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    // Constructor to set the contract owner (seller)
    constructor() {
        owner = msg.sender;
    }

    // Function for the seller to create a new sales order
    function createOrder(
        address _buyer,
        string memory _product,
        uint256 _quantity,
        uint256 _price
    ) public onlyOwner {
        orderIdCounter++;

        orders[orderIdCounter] = Order({
            id: orderIdCounter,
            buyer: _buyer,
            product: _product,
            quantity: _quantity,
            price: _price,
            isOrderConfirmed: false,
            isOrderCompleted: false
        });

        emit NewOrder(orderIdCounter, _buyer, owner);
    }

    // Function for the buyer to confirm a sales order
    function confirmOrder(uint256 _orderId) public {
        Order storage order = orders[_orderId];

        require(order.buyer == msg.sender, "Only the buyer can confirm the order.");
        require(!order.isOrderConfirmed, "Order is already confirmed.");

        order.isOrderConfirmed = true;

        emit OrderConfirmed(_orderId);
    }

    // Function for the buyer to mark a sales order as completed
    function completeOrder(uint256 _orderId) public {
        Order storage order = orders[_orderId];

        require(order.buyer == msg.sender, "Only the buyer can complete the order.");
        require(order.isOrderConfirmed, "Order must be confirmed before completing.");
        require(!order.isOrderCompleted, "Order is already completed.");

        order.isOrderCompleted = true;

        emit OrderCompleted(_orderId);
    }

    // Function for the seller to create an invoice for a sales order
    function createInvoice(uint256 _orderId) public onlyOwner {
        Order storage order = orders[_orderId];

        require(order.isOrderConfirmed, "Order must be confirmed before creating an invoice.");
        require(!order.isOrderCompleted, "Order is already completed.");

        uint256 invoiceAmount = order.price * order.quantity;

        _createInvoice(_orderId, invoiceAmount);
    }

    // Function for the buyer to pay an invoice
    function payInvoice(uint256 _invoiceId) public payable {
        Invoice storage invoice = invoices[_invoiceId];
        Order storage order = orders[invoice.orderId];

        require(msg.sender == order.buyer, "Only the buyer can pay the invoice.");
        require(msg.value == invoice.amount, "Payment amount must match the invoice amount.");

        _payInvoice(_invoiceId, payable(order.buyer), msg.value);
  }
}
