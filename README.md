# BookNook Server

**BookNook Server** is the backend API for BookNook, an online library management application. It provides book management, user authentication, and book borrowing and returning functionality.

## Live API

- **Backend:** [https://booknook-server-lib.vercel.app/](https://booknook-server-lib.vercel.app/)
- **GitHub Repository:** [https://github.com/hridoycoders/booknook-server](https://github.com/hridoycoders/booknook-server)

## Features

- RESTful API built with Express.js
- MongoDB database integration
- JWT-based authentication
- Retrieve all books and individual book details
- Add, update, and delete books
- Retrieve books added by the authenticated user
- Borrow and return books
- Protected API routes
- JSON responses and error handling
- Vercel deployment support

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Token (JWT)
- JOSE
- CORS
- dotenv
- Vercel

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hridoycoders/booknook-server.git
```

### 2. Navigate to the Project Directory

```bash
cd booknook-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

Replace the placeholder values with your actual credentials.

**Important:** Never share your secret credentials or commit your `.env` file to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

The server will run locally at:

`http://localhost:5000`

## API Documentation

### Base URL

```text
https://booknook-server-lib.vercel.app
```

### Books API

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/books` | Get all books | Public |
| GET | `/books/:id` | Get a single book | Public |
| GET | `/books/my-books` | Get books added by the logged-in user | Required |
| POST | `/books` | Add a new book | Required |
| PATCH | `/books/:id` | Update a book | Required |
| DELETE | `/books/:id` | Delete a book | Required |

### Borrow API

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/borrows` | Borrow a book | Required |
| GET | `/borrows` | Get the logged-in user's borrowing records | Required |
| DELETE | `/borrows/:id` | Return a borrowed book | Required |

### Authentication

Protected endpoints require a valid JWT access token in the request header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Replace `YOUR_ACCESS_TOKEN` with a valid authentication token.

For exact request body formats and response details, refer to the controller files.

## Project Structure

```text
booknook-server/
├── config/
│   └── db.js
├── controllers/
│   ├── bookController.js
│   └── borrowController.js
├── middleware/
│   └── verifyToken.js
├── routes/
│   ├── bookRoutes.js
│   └── borrowRoutes.js
├── .env
├── .gitignore
├── index.js
└── package.json
```

## Database

BookNook Server uses **MongoDB Atlas** to store book information and borrowing records.

## Deployment

The backend is deployed on **Vercel**, providing serverless API functionality.

## Author

**Hridoy Ahmed**

- **GitHub:** [@hridoycoders](https://github.com/hridoycoders)

---

*Part of the BookNook Online Library Management Project.*
