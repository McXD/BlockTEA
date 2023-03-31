const express = require("express");
const router = express.Router();
const Account  = require("../models/account");
const JournalEntry = require("../models/journalEntry");

// List all the accounts
router.get("/accounts", async (req, res) => {
    try {
        const accounts = await Account.find();
        res.status(200).json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Add an account
router.post("/accounts", async (req, res) => {
    const { name, type, balance } = req.body;

    try {
        const newAccount = new Account({ name, type, balance: balance || 0 });
        await newAccount.save();
        res.status(201).json(newAccount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete an account
router.delete("/accounts/:id", async (req, res) => {
    try {
        await Account.findByIdAndRemove(req.params.id);
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Update an account
router.put("/accounts/:id", async (req, res) => {
    const { name } = req.body;

    try {
        const updatedAccount = await Account.findByIdAndUpdate(req.params.id, { name }, { new: true });
        res.status(200).json(updatedAccount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// List all the journal entries under the account
router.get("/accounts/:id/journalEntries", async (req, res) => {
    try {
        const journalEntries = await JournalEntry.find({ account_id: req.params.id });
        res.status(200).json(journalEntries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

