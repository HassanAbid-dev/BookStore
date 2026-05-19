# 📚 Bookstore REST API

A production-grade RESTful API for a bookstore built with Node.js, Express, MongoDB, and Redis caching. Goes beyond the basic requirements by implementing JWT authentication, Zod validation, Redis caching with benchmarked performance results, and a clean layered architecture.

---

## 🛠 Tech Stack

| Technology         | Purpose                  |
| ------------------ | ------------------------ |
| Node.js + Express  | Server and routing       |
| MongoDB + Mongoose | Database and ODM         |
| JWT (jsonwebtoken) | Authentication           |
| bcryptjs           | Password hashing         |
| Zod                | Input validation         |
| Redis (ioredis)    | Caching layer            |
| nodemon            | Development auto-restart |

---

## 📁 Project Structure

```
server/
  ├── config/
  │   ├── db.config.js        ← MongoDB connection
  │   └── redis.config.js     ← Redis connection
  ├── controllers/
  │   ├── auth.controller.js  ← handles HTTP req/res for auth
  │   └── book.controller.js  ← handles HTTP req/res for books
  ├── middlewares/
  │   ├── auth.middleware.js  ← JWT verification
  │   └── error.middleware.js ← global error handler
  ├── models/
  │   ├── user.model.js       ← User schema
  │   └── book.model.js       ← Book schema
  ├── routes/
  │   ├── auth.routes.js      ← /api/auth endpoints
  │   └── book.routes.js      ← /api/books endpoints
  ├── services/
  │   ├── auth.service.js     ← auth business logic + Zod validation
  │   └── book.service.js     ← book business logic + Redis caching
  ├── server.js               ← starts the server
  ├── benchmark.js            ← performance testing
  └── .env.example            ← environment variable template
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local via WSL or Redis Cloud)

### Installation

```bash
# clone the repository
git clone https://github.com/HassanAbid-dev/BookStore.git
cd BookStore/server

# install dependencies
npm install

# create environment file
cp .env.example .env
# fill in your values in .env

# start the server
npm run dev
```

### Environment Variables

Create a `.env` file in the server folder:

```
PORT=3000
MONGODB_URL=mongodb://localhost:27017/bookstore
ACCESS_SECRET=your_random_secret_key_here
REDIS_URL=redis://localhost:6379
```

---

## 🔐 Authentication Endpoints

### Register

```
POST /api/auth/register
```

Request body:

```json
{
  "name": "Hassan Abid",
  "email": "hassan@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64abc123",
    "name": "Hassan Abid",
    "email": "hassan@gmail.com"
  }
}
```

### Login

```
POST /api/auth/login
```

Request body:

```json
{
  "email": "hassan@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGci...",
  "user": {
    "id": "64abc123",
    "name": "Hassan Abid",
    "email": "hassan@gmail.com"
  }
}
```

---

## 📖 Book Endpoints

### Get all books (public)

```
GET /api/books/all
```

Response:

```json
[
  {
    "_id": "64abc123",
    "title": "Atomic Habits",
    "author": "James Clear",
    "price": 20,
    "isbn": "1234567890",
    "publishedDate": "2018-10-16T00:00:00.000Z"
  }
]
```

### Get book by ID (public)

```
GET /api/books/:id
```

### Add a book (requires auth)

```
POST /api/books/add
Authorization: Bearer <your_token>
```

Request body:

```json
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "price": 20,
  "isbn": "1234567890",
  "publishedDate": "2018-10-16"
}
```

### Update a book (requires auth)

```
PUT /api/books/edit/:id
Authorization: Bearer <your_token>
```

### Delete a book (requires auth)

```
DELETE /api/books/delete/:id
Authorization: Bearer <your_token>
```

---

## ✅ Input Validation

All inputs are validated using **Zod** before touching the database.

| Field         | Rules                         |
| ------------- | ----------------------------- |
| name          | string, min 2, max 30         |
| email         | valid email format            |
| password      | min 6 characters              |
| title         | string, min 3, max 80         |
| author        | string, min 3, max 40         |
| price         | number, min 0                 |
| isbn          | string, min 3, max 30, unique |
| publishedDate | valid date string             |

---

## 🚀 Redis Caching

Redis caching is implemented on the book listing endpoint — the most frequently accessed endpoint in any bookstore API.

### How it works

```
First request  → cache miss → query MongoDB → store result in Redis (TTL: 1 hour)
Next requests  → cache hit  → return from Redis → MongoDB never touched

Create book    → invalidate cache
Update book    → invalidate cache
Delete book    → invalidate cache
```

### Cache-aside pattern

```
GET /api/books/all

Check Redis
    ↓
Cache hit?  → return instantly from RAM
    ↓
Cache miss? → query MongoDB → store in Redis → return
```

### Get book by ID optimization

Instead of creating individual Redis keys for each book, `getBookById` reuses the existing `all-books` cache. This avoids creating hundreds of individual Redis keys and keeps memory usage flat.

---

## 📊 Benchmark Results

Tested using **autocannon** with 50 concurrent connections over 10 seconds.

### Without Redis Cache (hitting MongoDB directly)

| Metric       | Value    |
| ------------ | -------- |
| Requests/sec | 1,606    |
| Latency avg  | 30.67ms  |
| Latency p99  | 65ms     |
| Max latency  | 1,855ms  |
| Throughput   | 751 KB/s |

### With Redis Cache

| Metric       | Value    |
| ------------ | -------- |
| Requests/sec | 1,898    |
| Latency avg  | 25.93ms  |
| Latency p99  | 60ms     |
| Max latency  | 162ms    |
| Throughput   | 887 KB/s |

### Improvement Summary

| Metric       | Without Cache | With Cache | Improvement   |
| ------------ | ------------- | ---------- | ------------- |
| Requests/sec | 1,606         | 1,898      | +18.1%        |
| Avg latency  | 30.67ms       | 25.93ms    | 4.74ms faster |
| p99 latency  | 65ms          | 60ms       | 8% faster     |
| Max latency  | 1,855ms       | 162ms      | 91% reduction |
| Throughput   | 751 KB/s      | 887 KB/s   | +18.1%        |

### Why max latency improvement matters most

Without cache, some requests randomly spike to **1,855ms** — almost 2 seconds. This happens when MongoDB has slow queries under load. Users experience this as the app feeling broken or frozen.

With Redis, the worst case drops to **162ms**. Redis serves data directly from RAM. No disk access. No network call to MongoDB. No matter how many concurrent users, response time stays consistent and predictable.

> In production, consistent latency is more important than average latency. A p99 of 60ms means 99 out of every 100 users get a response in under 60ms. Redis makes your API predictable under load.

---

## 🏃 Run Benchmark

```bash
# make sure server is running on port 3000
# make sure Redis is running
node benchmark.js
```

---

## 📝 Architecture Decisions

### Why layered architecture?

```
routes      → only defines URL and middleware chain
controllers → only handles HTTP req and res
services    → all business logic and database calls
models      → database schemas
```

Each layer has one job. This makes the code testable, readable, and maintainable as the project grows.

### Why JWT over sessions?

JWT is stateless — the server stores nothing. Any server instance can verify any token without a database lookup. This means the API scales horizontally without shared session storage.

### Why Zod over express-validator?

Zod provides schema definitions with precise error messages. It validates shape, type, and business rules in one place. The validated data is guaranteed clean before reaching business logic.

### Why Redis for caching?

In-memory caching dies when the server restarts. Redis is an external shared cache — all server instances read from the same source, cache survives restarts, and it is production-ready.

---

## 📬 Submission

- GitHub: https://github.com/HassanAbid-dev/BookStore
- All 5 required endpoints implemented
- Bonus implemented: JWT authentication, Zod input validation, Redis caching with benchmark proof
