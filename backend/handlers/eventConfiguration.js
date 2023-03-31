const express = require("express");
const router = express.Router();
const EventConfiguration = require("../models/eventConfiguration");

// Add an event effect
router.post("/:contractId/:eventName", async (req, res) => {
    const { accountId, amountField, operation } = req.body;

    try {
        let eventConfiguration = await EventConfiguration.findOne({ smartContractId: req.params.contractId, eventName: req.params.eventName });
        if (!eventConfiguration) {
            eventConfiguration = new EventConfiguration({ smartContractId: req.params.contractId, eventName: req.params.eventName, eventEffects: [] });
            await eventConfiguration.save();
        }

        eventConfiguration.eventEffects.push({ accountId, amountField, operation });
        await eventConfiguration.save();
        res.status(201).json(eventConfiguration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get event configuration
router.get("/:contractId/:eventName", async (req, res) => {
    try {
        const eventConfiguration = await EventConfiguration.findOne({ smartContractId: req.params.contractId, eventName: req.params.eventName });
        res.status(200).json(eventConfiguration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete an event effect
router.delete("/:contractId/:eventName/:effectId", async (req, res) => {
    try {
        const eventConfiguration = await EventConfiguration.findOne({ smartContractId: req.params.contractId, eventName: req.params.eventName });
        eventConfiguration.eventEffects = eventConfiguration.eventEffects.filter(effect => effect._id !== req.params.effectId);
        await eventConfiguration.save();
        res.status(200).json({ message: "Event effect deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
