import Book from "../models/bookModel.js";
import { z } from "zod";
import Redis from "ioredis";
const redis = new Redis({
  host: "localhost",
  port: 6379,
});
// Validation schema for creating/updating a book
const bookSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be 3 charecters long")
    .max(80, "Title cannot be longer than 80 characters"),
  author: z
    .string()
    .min(3, "Author must be 3 characters long.")
    .max(40, "Author can not be longer than 40 characters"),
  price: z.number().min(0),
  isbn: z
    .string()
    .min(3, "isbn must be 3 characters long")
    .max(30, "isbn can't be longer than 30 characters"),
  publishedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});
export const createBook = async ({
  title,
  author,
  price,
  isbn,
  publishedDate,
}) => {
  const result = bookSchema.safeParse({
    title,
    author,
    price,
    isbn,
    publishedDate,
  });
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  const existingBook = await Book.findOne({ isbn });
  if (existingBook) {
    throw new Error("Book with this ISBN already exists");
  }
  const book = await Book.create({
    title,
    author,
    price,
    isbn,
    publishedDate: new Date(result.data.publishedDate),
  });
  return {
    message: "Book created successfully",
    book,
  };
};

export const updateBook = async ({
  title,
  author,
  price,
  isbn,
  publishedDate,
  id,
}) => {
  const result = bookSchema.safeParse({
    title,
    author,
    price,
    isbn,
    publishedDate,
  });
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  const book = await Book.findOne({
    _id: id,
  });
  if (!book) {
    throw new Error("Book not found");
  }
  book.title = result.data.title;
  book.author = result.data.author;
  book.price = result.data.price;
  book.publishedDate = new Date(result.data.publishedDate);
  await book.save();
  return {
    message: "Book updated successfully",

    book,
  };
};

export const deleteBook = async ({ id }) => {
  const book = await Book.findOne({
    _id: id,
  });
  if (!book) {
    throw new Error("Book not found");
  }
  await book.deleteOne();
  return {
    message: "Book deleted successfully",
  };
};

export const getAllBooks = async () => {
  const cached = await redis.get("all-books");
  if (cached) {
    console.log("Cache hit");
    return JSON.parse(cached);
  }
  console.log("Cache miss");
  const books = await Book.find();
  await redis.set("all-books", JSON.stringify(books), "EX", 3600); // Cache for 1 hour
  return books;
};
export const getBookById = async ({ id }) => {
  const cachedBooks = await redis.get("all-books");
  if (cachedBooks) {
    const books = JSON.parse(cachedBooks);
    const book = books.find((b) => b._id.toString() === id);
    if (book) {
      console.log("Cache hit for book id:", id);
      return book;
    }
  }

  // cache miss or book not in cache — query DB
  console.log("Cache miss for book id:", id);
  const book = await Book.findById(id);
  if (!book) throw new Error("Book not found");

  // refresh cache with latest data
  const allBooks = await Book.find();
  await redis.set("all-books", JSON.stringify(allBooks), "EX", 3600);

  return book;
};
