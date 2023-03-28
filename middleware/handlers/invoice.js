// 1. Set up your project and install the required dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/invoice", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 2. Define the Mongoose schema and model for the invoices
const invoiceSchema = new mongoose.Schema({
  id: Number,
  seller: String,
  amount: Number,
  description: String,
  paid: Boolean,
  timestamp: Number,
  offChainPaymentTxHash: String,
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

// 3. Create the Express.js API handlers for the operations
app.post("/api/invoices", async (req, res) => {
  const { id, seller, amount, description, paid, timestamp } = req.body;
  const invoice = new Invoice({
    id,
    seller,
    amount,
    description,
    paid,
    timestamp,
  });

  try {
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/api/invoices/:id/pay", async (req, res) => {
  const { id } = req.params;
  const { offChainPaymentTxHash } = req.body;

  try {
    const invoice = await Invoice.findOne({ id });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    invoice.paid = true;
    invoice.offChainPaymentTxHash = offChainPaymentTxHash;

    const updatedInvoice = await invoice.save();
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/invoices/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await Invoice.findOne({ id });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// api to get all invoices with pagination
app.get("/api/invoices", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const invoices = await Invoice.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Invoice.countDocuments();

    res.status(200).json({
      invoices,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
