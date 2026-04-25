import express from "express";
const app = express();

app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running...");
});

// GET DATA
app.get("/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop", price: 50000 },
    { id: 2, name: "Phone", price: 20000 }import express from "express";

const app = express();
app.use(express.json());

// TEST
app.get("/", (req, res) => {
  res.send("API is live");
});

// SAMPLE DATA
app.get("/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop", price: 50000 },
    { id: 2, name: "Phone", price: 20000 }
  ]);
});

// POST API
app.post("/orders", (req, res) => {
  res.json({
    message: "Order created",
    data: req.body
  });
});

// IMPORTANT for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
  ]);
});

// POST DATA
app.post("/orders", (req, res) => {
  const order = req.body;
  res.json({
    message: "Order placed successfully",
    order
  });
});

// ADMIN ROUTE
app.get("/admin", (req, res) => {
  res.json({ secret: "Admin data" });
});

// START SERVER
app.listen(5000, () => {
  console.log("Backend API running on port 5000");
});