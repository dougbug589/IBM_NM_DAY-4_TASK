# 📚 Library Management System

A full-stack web application for managing library books with MongoDB, Express.js, and a modern responsive frontend.

![Library Management System](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## ✨ Features

### 📊 Dashboard
- Real-time statistics (total books, copies, categories)
- Beautiful gradient UI design
- Responsive layout for all devices

### 🔧 CRUD Operations
- ✅ **Create** - Add new books with validation
- ✅ **Read** - View all books in table format
- ✅ **Update** - Edit book details and manage copies
- ✅ **Delete** - Remove books (with validation)

### 🔍 Advanced Features
- Filter books by category
- Search books published after specific year
- Increase/decrease available copies with ➕➖ buttons
- Seed database with sample data
- Real-time error handling and validation

### 🛡️ Error Handling
- Cannot delete books with available copies
- Prevents negative stock
- Invalid category validation
- Book not found handling
- User-friendly error messages

## 🚀 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Architecture**: REST API

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/IBM_NM_DAY-4_TASK.git
cd IBM_NM_DAY-4_TASK
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start MongoDB
```bash
# On Linux (systemd)
sudo systemctl start mongodb

# On macOS (Homebrew)
brew services start mongodb-community

# On Windows
net start MongoDB
```

### 4. Run the application
```bash
node server.js
```

### 5. Open in browser
```
http://localhost:3000
```

## 📁 Project Structure

```
library-management/
├── public/
│   └── index.html          # Frontend UI
├── server.js               # Express server & API routes
├── library.js              # Standalone MongoDB script
├── package.json
├── package-lock.json
└── README.md
```

## 🗄️ Database Schema

### Books Collection

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | String | Yes | Not empty |
| author | String | Yes | Not empty |
| category | String | Yes | Enum values |
| publishedYear | Number | Yes | 1000 - Current Year |
| availableCopies | Number | Yes | Min: 0 |

### Categories
- Fiction
- Non-Fiction
- Science
- Technology
- History
- Biography
- Self-Help

## 🔌 API Endpoints

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get single book |
| GET | `/api/books/category/:category` | Get books by category |
| GET | `/api/books/year/:year` | Get books after year |
| POST | `/api/books` | Add new book |
| PUT | `/api/books/:id` | Update book |
| PATCH | `/api/books/:id/copies` | Update copies |
| DELETE | `/api/books/:id` | Delete book |
| POST | `/api/seed` | Seed sample data |

### Example Requests

#### Add a Book
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "category": "Fiction",
    "publishedYear": 1925,
    "availableCopies": 5
  }'
```

#### Update Copies
```bash
curl -X PATCH http://localhost:3000/api/books/BOOK_ID/copies \
  -H "Content-Type: application/json" \
  -d '{"change": 2}'
```

#### Filter by Category
```bash
curl http://localhost:3000/api/books/category/Fiction
```

## 💻 Usage

### Using the Web Interface

1. **View Books**: Click on "📖 View Books" tab
2. **Add Book**: Navigate to "➕ Add Book" tab and fill the form
3. **Filter Books**: Use "🔍 Filter Books" tab to search
4. **Update Copies**: Use ➕➖ buttons in the table
5. **Edit Book**: Click "Edit" button on any book
6. **Delete Book**: Click "Delete" (only works if copies = 0)
7. **Seed Data**: Click "🌱 Seed Sample Data" for demo books

### Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh

# Switch to database
use libraryDB

# View all books
db.books.find().pretty()

# Find by category
db.books.find({ category: "Fiction" })

# Find books after 2015
db.books.find({ publishedYear: { $gt: 2015 } })
```

### Using the Standalone Script

```bash
node library.js
```

This runs a demo with all CRUD operations and error handling examples.

## 🎨 Screenshots

### Dashboard
- Live statistics and book count
- Modern gradient design
- <img width="1919" height="976" alt="Screenshot_20260103_161549" src="https://github.com/user-attachments/assets/79c61c92-45ab-413b-9484-c2936f5c4a33" />


### Book Management
- Add, edit, delete books
- Filter and search functionality
- Copy management with intuitive controls
- <img width="1920" height="973" alt="Screenshot_20260103_161707" src="https://github.com/user-attachments/assets/42bfe3cf-0e76-4e1a-8948-c9aac62d9f9f" />
- <img width="1920" height="972" alt="Screenshot_20260103_161646" src="https://github.com/user-attachments/assets/821e3fb9-03c8-4662-b7e9-9eb714918977" />
- <img width="1920" height="972" alt="Screenshot_20260103_161606" src="https://github.com/user-attachments/assets/6163dea6-281e-4518-be52-a1ff11d05b4d" />


### Error Handling
- Validation messages
- User-friendly error displays

## 🧪 Testing

### Manual Testing Checklist

- [ ] Add a new book
- [ ] View all books
- [ ] Filter by category
- [ ] Filter by year
- [ ] Increase copies
- [ ] Decrease copies
- [ ] Edit book category
- [ ] Try to delete book with copies (should fail)
- [ ] Set copies to 0, then delete (should succeed)
- [ ] Try negative copies (should fail)
- [ ] Try invalid category (should fail)

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb
```

### Port Already in Use
```bash
# Change port in server.js
const PORT = 3001; // or any available port
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 🔒 Security Notes

- Input validation on both client and server
- MongoDB injection prevention with Mongoose
- Schema validation enforced
- Error messages don't expose system details

## This project is created for educational purposes as part of IBM NM Day-4 Task.

---
