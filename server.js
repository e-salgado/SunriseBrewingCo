const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to JSON file
const FILE_PATH = "./CustomerInfo.json";

// Create file if it doesn't exist
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
}

// Save shipping info route
app.post("/save-shipping", (req, res) => {
    const newEntry = req.body;

    // Load existing file data
    let existing = JSON.parse(fs.readFileSync(FILE_PATH));

    // Add new shipping record
    existing.push({
        ...newEntry,
        timestamp: new Date().toISOString()
    });

    // Save file back to disk
    fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2));

    console.log("Saved new shipping entry:", newEntry.firstName, newEntry.lastName);
    res.json({ message: "Shipping info saved", saved: newEntry });
});

// Save billing info route
app.post("/save-billing", (req, res) => {
    const newBilling = req.body;

    // Load existing file data
    let existing = JSON.parse(fs.readFileSync(FILE_PATH));

    // Add new billing record
    existing.push({
        ...newBilling,
        timestamp: new Date().toISOString()
    });

    // Save file back to disk
    fs.writeFileSync(FILE_PATH, JSON.stringify(existing, null, 2));

    console.log("Saved new billing entry:", newBilling.firstName, newBilling.lastName);
    res.json({ message: "Billing info saved", saved: newBilling });
});

app.get('/', (req, res) => {
    res.send('Welcome to the homepage!');
});

const RETURNS_FILE = "./returns.json";

// Ensure Returns.json exists
if (!fs.existsSync(RETURNS_FILE)) {
    fs.writeFileSync(RETURNS_FILE, JSON.stringify([], null, 2));
}

app.post("/submit-return", (req, res) => {
    const newReturn = req.body;

    // Load existing return data
    let existingReturns = JSON.parse(fs.readFileSync(RETURNS_FILE));

    // Normalize incoming items (support both id strings and item objects)
    const items = (newReturn.items || []).map(it => {
        const raw = (typeof it === 'string') ? { id: it } : it;
        return {
            id: raw.id || null,
            name: raw.name || null,
            quantity: Number(raw.quantity || 1),
            price: Number(raw.price || 0)
        };
    });

    // Compute refund amount
    const refundAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Append new return (store normalized items and refundAmount)
    const toSave = {
        ...newReturn,
        items,
        refundAmount,
        timestamp: new Date().toISOString()
    };

    existingReturns.push(toSave);

    // Save file
    fs.writeFileSync(RETURNS_FILE, JSON.stringify(existingReturns, null, 2));

    console.log("Saved return request:", {
        reason: toSave.reason,
        items: toSave.items.map(it => ({ id: it.id, name: it.name, quantity: it.quantity, price: it.price })),
        refundAmount: toSave.refundAmount
    });

    res.json({ message: "Return request saved", saved: toSave });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
