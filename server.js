// ==================== SERVER.JS ====================
// Full-stack Library Management System with Express + HTML Frontend

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==================== DATABASE CONNECTION ====================
mongoose.connect('mongodb://localhost:27017/libraryDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('✓ Connected to libraryDB'));

// ==================== SCHEMA ====================
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-Help']
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: 1000,
    max: new Date().getFullYear()
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: 0,
    default: 1
  }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

// ==================== API ROUTES ====================

// CREATE - Add new book
app.post('/api/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// READ - Get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// READ - Get books by category
app.get('/api/books/category/:category', async (req, res) => {
  try {
    const books = await Book.find({ category: req.params.category });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// READ - Get books after year
app.get('/api/books/year/:year', async (req, res) => {
  try {
    const books = await Book.find({ publishedYear: { $gt: parseInt(req.params.year) } });
    res.json({ success: true, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// READ - Get single book
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE - Update book
app.put('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// UPDATE - Update copies
app.patch('/api/books/:id/copies', async (req, res) => {
  try {
    const { change } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const newCopies = book.availableCopies + change;
    if (newCopies < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot have negative copies' 
      });
    }

    book.availableCopies = newCopies;
    await book.save();
    
    res.json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE - Delete book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    if (book.availableCopies > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot delete book with ${book.availableCopies} copies available` 
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed database with initial books
app.post('/api/seed', async (req, res) => {
  try {
    await Book.deleteMany({});
    const books = [
      { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", publishedYear: 1925, availableCopies: 5 },
      { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", publishedYear: 1960, availableCopies: 3 },
      { title: "Sapiens", author: "Yuval Noah Harari", category: "History", publishedYear: 2011, availableCopies: 7 },
      { title: "Educated", author: "Tara Westover", category: "Biography", publishedYear: 2018, availableCopies: 4 },
      { title: "The Lean Startup", author: "Eric Ries", category: "Technology", publishedYear: 2011, availableCopies: 6 },
      { title: "Atomic Habits", author: "James Clear", category: "Self-Help", publishedYear: 2018, availableCopies: 8 },
      { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", publishedYear: 1988, availableCopies: 2 },
      { title: "The Midnight Library", author: "Matt Haig", category: "Fiction", publishedYear: 2020, availableCopies: 10 }
    ];
    
    const result = await Book.insertMany(books);
    res.json({ success: true, message: `Inserted ${result.length} books`, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});