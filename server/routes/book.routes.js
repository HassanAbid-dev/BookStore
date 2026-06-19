import {
  addBook,
  removeBook,
  editBook,
  getBook,
  getBooks,
} from "../controllers/bookcontroller.js";
import Router from "express";
import authMiddleware from "../middlewares/authmiddleware.js";
import redis from "../config/redis.js";
const bookRouter = Router();

bookRouter.delete("/flush-cache", async (req, res) => {
  await redis.del("all-books");
  res.json({ message: "Cache cleared" });
});
bookRouter.post("/add", authMiddleware, addBook);
bookRouter.put("/edit/:id", authMiddleware, editBook);
bookRouter.delete("/delete/:id", authMiddleware, removeBook);
bookRouter.get("/all", getBooks);
bookRouter.get("/:id", getBook);

export default bookRouter;
