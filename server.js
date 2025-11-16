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

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
