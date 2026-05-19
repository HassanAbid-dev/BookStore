import {
  createBook,
  updateBook,
  deleteBook,
  getBookById,
  getAllBooks,
} from "../services/book.service.js";

export const addBook = async (req, res) => {
  try {
    const result = await createBook(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const editBook = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await updateBook({ ...req.body, id });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeBook = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteBook({ id });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const books = await getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBook = async (req, res) => {
  try {
    const book = await getBookById({ id: req.params.id });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
