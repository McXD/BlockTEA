const BlockchainEvent = require("../models/blockchainEvent");
const router = require("express").Router();

// Get event by id
router.get("/:id", async (req, res) => {
    try {
        const event = await BlockchainEvent.findById(req.params.id);
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all events
router.get("/", async (req, res) => {
    try {
        const events = await BlockchainEvent.find();
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
