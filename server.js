// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON

const DATA_FILE = path.join(__dirname, "CustomerInfo.json");

// Helper function to save data to JSON file
function saveToJSON(newEntry, res) {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        let jsonData = [];
        if (!err && data) {
            try {
                jsonData = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing JSON:", e);
            }
        }

        jsonData.push(newEntry);

        fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error("Error writing JSON:", err);
                return res.status(500).json({ success: false, message: "Failed to save data" });
            }
            res.json({ success: true, message: "Data saved successfully" });
        });
    });
}

// POST route for shipping info
app.post("/save-shipping", (req, res) => {
    const shippingData = req.body;
    shippingData.type = "shipping";
    saveToJSON(shippingData, res);
});

// POST route for billing info
app.post("/save-billing", (req, res) => {
    const billingData = req.body;
    billingData.type = "billing";
    saveToJSON(billingData, res);
});

app.use(express.static(__dirname));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


