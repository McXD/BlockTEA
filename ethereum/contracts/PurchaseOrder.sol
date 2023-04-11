// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./InvoiceBase.sol";

contract PurchaseOrder is InvoiceBase {
    // Defining the Purchase Order struct
    struct Order {
        uint256 id;
        address seller;
        string product;
        uint256 quantity;
        uint256 price;
        bool isOrderConfirmed;
        bool isOrderCompleted;
        bool isInvoiceCreated;
        bool isInvoicePaid;
        uint256 invoiceId;
    }

    // Mapping to store orders with their IDs
    mapping(uint256 => Order) public orders;

    // Order ID counter
    uint256 public orderIdCounter;

    // Contract owner (buyer)
    address public owner;

    // Events
    event NewOrder(uint256 orderId, address indexed buyer, address indexed seller, uint256 totalAmount);
    event OrderConfirmed(uint256 orderId, address indexed buyer, address indexed seller, uint256 totalAmount);
    event OrderCompleted(uint256 orderId);

    // Modifier to restrict function access only to the contract owner (buyer)
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    // Constructor to set the contract owner (buyer)
    constructor() {
        owner = msg.sender;
    }

    // Function for the buyer to create a new purchase order
    function createOrder(
        address _seller,
        string memory _product,
        uint256 _quantity,
        uint256 _price
    ) public onlyOwner {
        orderIdCounter++;

        orders[orderIdCounter] = Order({
            id: orderIdCounter,
            seller: _seller,
            product: _product,
            quantity: _quantity,
            price: _price,
            isInvoiceCreated: false,
            isInvoicePaid: false,
            isOrderConfirmed: false,
            isOrderCompleted: false,
            invoiceId: 0
        });

        emit NewOrder(orderIdCounter, owner, _seller, _price * _quantity);
    }

    // Function for the seller to confirm a purchase order
    function confirmOrder(uint256 _orderId) public {
        Order storage order = orders[_orderId];

        require(order.seller == msg.sender, "Only the seller can confirm the order.");
        require(!order.isOrderConfirmed, "Order is already confirmed.");

        order.isOrderConfirmed = true;

        emit OrderConfirmed(_orderId, owner, msg.sender, order.price * order.quantity);
    }

    // Function for the buyer to mark a purchase order as completed
    function completeOrder(uint256 _orderId) public onlyOwner {
        Order storage order = orders[_orderId];

        require(order.isOrderConfirmed, "Order must be confirmed before completing.");
        require(!order.isOrderCompleted, "Order is already completed.");

        order.isOrderCompleted = true;

        emit OrderCompleted(_orderId);
    }

    // Function to get the order details
    function getOrder(uint256 _orderId)
        public
        view
        returns (Order memory)
    {
        Order storage order = orders[_orderId];
        return order;
    }

    // Function for the seller to create an invoice for a purchase order
    function createInvoice(uint256 _orderId) public {
        Order storage order = orders[_orderId];

        require(order.isOrderConfirmed, "Order must be confirmed before creating an invoice.");
        require(!order.isOrderCompleted, "Order is already completed.");
        require(order.seller == msg.sender, "Only the seller can create an invoice.");

        uint256 invoiceAmount = order.price * order.quantity;

        _createInvoice(_orderId, invoiceAmount);
        order.invoiceId = invoiceIdCounter;
        order.isInvoiceCreated = true;
    }

    // Function for the buyer to pay an invoice by order ID
    function payInvoice(uint256 _orderId) public payable onlyOwner {
        Order storage order = orders[_orderId];
        Invoice storage invoice = invoices[order.invoiceId];

        require(order.isOrderConfirmed, "Order must be confirmed before paying an invoice.");
        require(!order.isOrderCompleted, "Order is already completed.");
        uint256 invoiceAmount = invoice.amount;
        require(msg.value >= invoice.amount, "Sent Ether value must be bigger than the invoice amount.");

        _payInvoice(invoice.id, payable(order.seller), invoiceAmount);
        order.isInvoicePaid = true;
    }
}
