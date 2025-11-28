import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import routes from "./routes/auth.routes.js";
dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Connect DB
connectDB();

// Mount routes
app.use("/auth", routes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
