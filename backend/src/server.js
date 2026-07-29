import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());


// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to Server");
});

// About Route
app.get("/about", (req, res) => {
  res.send("Welcome to About Us Page");
});

// Student Route
app.get("/student", (req, res) => {
  res.json({
    id: 1,
    name: "Darshana",
    course: "MERN Stack",
  });
});

// Employee Route
app.get("/employee", (req, res) => {
  res.json({
    id: 1,
    name: "Darshana",
    role: "Frontend Developer",
    salary: 50000,
  });
});

// Create Data (POST)
app.post("/create", (req, res) => {
  res.send("Post created successfully");
});

// Update Appointment (PUT)
app.put("/appointment/:id", (req, res) => {
  res.send("Appointment updated successfully");
});

// Delete Appointment (DELETE)
app.delete("/appointment/:id", (req, res) => {
  res.send("Appointment deleted successfully");
});

// Route Parameters (Single Parameter)
app.get("/doctors/:id", (req, res) => {
  res.send(req.params.id);
});

// Route Parameters (Multiple Parameters)
app.get("/appointments/:id/:name", (req, res) => {
  res.json(req.params);
});

// Query Parameters
app.get("/doctors", (req, res) => {
  res.json(req.query);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});