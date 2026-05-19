import {
  addBook,
  removeBook,
  editBook,
  getBook,
  getBooks,
} from "../controllers/bookcontroller.js";
import Router from "express";
import authMiddleware from "../middlewares/authmiddleware.js";

const bookRouter = Router();

bookRouter.post("/add", authMiddleware, addBook);
bookRouter.put("/edit/:id", authMiddleware, editBook);
bookRouter.delete("/delete/:id", authMiddleware, removeBook);
bookRouter.get("/all", getBooks);
bookRouter.get("/:id", getBook);

export default bookRouter;
