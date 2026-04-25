import express from "express";

const app = express();
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("API is LIVE 🚀");
});

// Data route
app.get("/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop", price: 50000 },
    { id: 2, name: "Phone", price: 20000 }
  ]);
});

// POST route
app.post("/orders", (req, res) => {
  res.json({
    message: "Order created",
    data: req.body
  });
});

// IMPORTANT for deployment
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});