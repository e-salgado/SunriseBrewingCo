const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


//CONNECT TO MONGODB USING MONGOOSE


mongoose.connect("mongodb://127.0.0.1:27017/SunriseBrewingDB")
  .then(() => {
    console.log("Connected to MongoDB");
    seedProducts();
  })
  .catch(err => console.error("Connection error:", err));



//MONGOOSE SCHEMAS

// PRODUCTS
const ProductSchema = new mongoose.Schema({
    name: String,
    ProductID: String,
    desc: String,
    Tags: [String],
    price: Number,
    category: String,
    UnitOfMeasure: String,
    img: String
});
const Product = mongoose.model("Product", ProductSchema);

// CART
const CartSchema = new mongoose.Schema({
    items: [
        {
            productId: String,
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    total: Number,
    createdAt: { type: Date, default: Date.now }
});
const Cart = mongoose.model("Cart", CartSchema);

// SHIPPING
const ShippingSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    email: String,
    phone: String,
    createdAt: { type: Date, default: Date.now }
});
const Shipping = mongoose.model("Shipping", ShippingSchema);

// BILLING
const BillingSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    cardNumber: String,
    expDate: String,
    cvv: String,
    billingAddress: String,
    zip: String,
    email: String,
    createdAt: { type: Date, default: Date.now }
});
const Billing = mongoose.model("Billing", BillingSchema);

// RETURNS
const ReturnSchema = new mongoose.Schema({
    reason: String,
    items: [
        {
            id: String,
            name: String,
            quantity: Number,
            price: Number
        }
    ],
    refundAmount: Number,
    createdAt: { type: Date, default: Date.now }
});
const ReturnRequest = mongoose.model("Return", ReturnSchema);

// products
function seedProducts() {
    const filePath = path.join(__dirname, 'public', 'products.json');
    const rawData = fs.readFileSync(filePath);
    const products = JSON.parse(rawData);

    products.forEach(async (p) => {
        const existing = await Product.findOne({ ProductID: p.ProductID });
        if (!existing) {
            const newProduct = new Product(p);
            await newProduct.save();
            console.log(`Inserted product: ${p.ProductID} - ${p.name}`);
        }
    });
}

//PRODUCT ROUTES

// GET all products
app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Add product manually
app.post("/add-product", async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json({ success: true, product: newProduct });
});

//CART ROUTE

app.post("/save-cart", async (req, res) => {
    try {
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        const total = Number(req.body.total) || 0;

        if (items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const newCart = new Cart({ items, total });
        await newCart.save();

        res.json({ success: true, cartId: newCart._id });
    } catch (err) {
        console.error("Error saving cart:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

//SHIPPING ROUTE

app.post("/save-shipping", async (req, res) => {
    const shipping = new Shipping(req.body);
    await shipping.save();
    res.json({ success: true, shipping });
});

//BILLING ROUTE


app.post("/save-billing", async (req, res) => {
    const billing = new Billing(req.body);
    await billing.save();
    res.json({ success: true, billing });
});

//RETURN ROUTE

app.post("/submit-return", async (req, res) => {
    let data = req.body;

    // calculate refund
    data.items = data.items.map(it => ({
        id: it.id || null,
        name: it.name || null,
        quantity: Number(it.quantity),
        price: Number(it.price)
    }));

    data.refundAmount = data.items.reduce(
        (sum, i) => sum + (i.price * i.quantity), 0
    );

    const returnRequest = new ReturnRequest(data);
    await returnRequest.save();

    res.json({ success: true, returnId: returnRequest._id });
});

//START SERVER

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


