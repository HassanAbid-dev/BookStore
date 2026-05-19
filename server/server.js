import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRouter from "./routes/auth.routes.js";
import bookRouter from "./routes/book.routes.js";
import connectDB from "./config/db.config.js";

const app = express();
// Connect to MongoDB
connectDB();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
