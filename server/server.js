const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const propertyRoutes = require("./routes/propertyRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/properties", propertyRoutes);

const PORT = 8000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("NeighborNet API running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});