import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
app.use("/auth", authRoutes);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});