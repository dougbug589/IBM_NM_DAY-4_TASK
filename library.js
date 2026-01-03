const mongoose = require('mongoose');

// ==================== DATABASE CONNECTION ====================
mongoose.connect('mongodb://localhost:27017/libraryDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to libraryDB'));

// ==================== SCHEMA DEFINITION ====================
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    minlength: [1, 'Author cannot be empty']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Self-Help'],
      message: '{VALUE} is not a valid category'
    }
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Published year must be after 1000'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future'],
    validate: {
      validator: Number.isInteger,
      message: 'Published year must be an integer'
    }
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: [0, 'Available copies cannot be negative'],
    default: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Available copies must be an integer'
    }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
bookSchema.index({ category: 1 });
bookSchema.index({ publishedYear: 1 });
bookSchema.index({ title: 1, author: 1 });

const Book = mongoose.model('Book', bookSchema);

// ==================== CREATE: INSERT BOOKS ====================
async function insertBooks() {
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: "Fiction",
      publishedYear: 1925,
      availableCopies: 5
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      category: "Fiction",
      publishedYear: 1960,
      availableCopies: 3
    },
    {
      title: "Sapiens",
      author: "Yuval Noah Harari",
      category: "History",
      publishedYear: 2011,
      availableCopies: 7
    },
    {
      title: "Educated",
      author: "Tara Westover",
      category: "Biography",
      publishedYear: 2018,
      availableCopies: 4
    },
    {
      title: "The Lean Startup",
      author: "Eric Ries",
      category: "Technology",
      publishedYear: 2011,
      availableCopies: 6
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      category: "Self-Help",
      publishedYear: 2018,
      availableCopies: 8
    },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      category: "Science",
      publishedYear: 1988,
      availableCopies: 2
    },
    {
      title: "The Midnight Library",
      author: "Matt Haig",
      category: "Fiction",
      publishedYear: 2020,
      availableCopies: 10
    }
  ];

  try {
    await Book.deleteMany({}); // Clear existing books
    const result = await Book.insertMany(books);
    console.log(`✓ Successfully inserted ${result.length} books`);
    return result;
  } catch (error) {
    console.error('✗ Error inserting books:', error.message);
    throw error;
  }
}

// ==================== READ OPERATIONS ====================

// Read all books
async function getAllBooks() {
  try {
    const books = await Book.find({});
    console.log(`\n📚 All Books (${books.length} found):`);
    books.forEach(book => {
      console.log(`  - ${book.title} by ${book.author} (${book.publishedYear}) - ${book.availableCopies} copies`);
    });
    return books;
  } catch (error) {
    console.error('✗ Error fetching all books:', error.message);
    throw error;
  }
}

// Read books by category
async function getBooksByCategory(category) {
  try {
    const books = await Book.find({ category });
    if (books.length === 0) {
      console.log(`\n📖 No books found in category: ${category}`);
      return books;
    }
    console.log(`\n📖 Books in ${category} (${books.length} found):`);
    books.forEach(book => {
      console.log(`  - ${book.title} by ${book.author}`);
    });
    return books;
  } catch (error) {
    console.error('✗ Error fetching books by category:', error.message);
    throw error;
  }
}

// Read books published after 2015
async function getBooksAfter2015() {
  try {
    const books = await Book.find({ publishedYear: { $gt: 2015 } });
    console.log(`\n📅 Books published after 2015 (${books.length} found):`);
    books.forEach(book => {
      console.log(`  - ${book.title} (${book.publishedYear}) - ${book.availableCopies} copies`);
    });
    return books;
  } catch (error) {
    console.error('✗ Error fetching books after 2015:', error.message);
    throw error;
  }
}

// ==================== UPDATE OPERATIONS ====================

// Update available copies (increase or decrease)
async function updateCopies(title, change) {
  try {
    const book = await Book.findOne({ title });
    
    if (!book) {
      throw new Error(`Book not found: ${title}`);
    }

    const newCopies = book.availableCopies + change;
    
    if (newCopies < 0) {
      throw new Error(`Invalid update: Cannot have negative copies. Current: ${book.availableCopies}, Change: ${change}`);
    }

    book.availableCopies = newCopies;
    await book.save();
    
    console.log(`✓ Updated "${title}": ${book.availableCopies - change} → ${book.availableCopies} copies`);
    return book;
  } catch (error) {
    console.error('✗ Error updating copies:', error.message);
    throw error;
  }
}

// Change book category
async function changeCategory(title, newCategory) {
  try {
    const book = await Book.findOne({ title });
    
    if (!book) {
      throw new Error(`Book not found: ${title}`);
    }

    const oldCategory = book.category;
    book.category = newCategory;
    await book.save();
    
    console.log(`✓ Updated "${title}": ${oldCategory} → ${newCategory}`);
    return book;
  } catch (error) {
    console.error('✗ Error changing category:', error.message);
    throw error;
  }
}

// ==================== DELETE OPERATIONS ====================

// Delete book if copies = 0
async function deleteBookIfNoCopies(title) {
  try {
    const book = await Book.findOne({ title });
    
    if (!book) {
      throw new Error(`Book not found: ${title}`);
    }

    if (book.availableCopies > 0) {
      throw new Error(`Invalid delete: Book "${title}" still has ${book.availableCopies} copies available`);
    }

    await Book.deleteOne({ title });
    console.log(`✓ Deleted "${title}" (0 copies)`);
    return { deleted: true, book };
  } catch (error) {
    console.error('✗ Error deleting book:', error.message);
    throw error;
  }
}

// ==================== DEMONSTRATION ====================
async function runDemo() {
  try {
    console.log('='.repeat(60));
    console.log('📚 LIBRARY BOOK MANAGEMENT SYSTEM DEMO');
    console.log('='.repeat(60));

    // 1. INSERT BOOKS
    console.log('\n1️⃣  INSERTING BOOKS...');
    await insertBooks();

    // 2. READ OPERATIONS
    console.log('\n2️⃣  READ OPERATIONS...');
    await getAllBooks();
    await getBooksByCategory('Fiction');
    await getBooksAfter2015();

    // 3. UPDATE OPERATIONS
    console.log('\n3️⃣  UPDATE OPERATIONS...');
    await updateCopies('Atomic Habits', 2); // Increase by 2
    await updateCopies('The Great Gatsby', -1); // Decrease by 1
    await changeCategory('A Brief History of Time', 'Non-Fiction');

    // 4. ERROR HANDLING DEMONSTRATIONS
    console.log('\n4️⃣  ERROR HANDLING DEMONSTRATIONS...');
    
    // Try negative stock
    console.log('\n❌ Attempting negative stock:');
    try {
      await updateCopies('Atomic Habits', -100);
    } catch (error) {
      console.log(`  Caught: ${error.message}`);
    }

    // Try book not found
    console.log('\n❌ Attempting to update non-existent book:');
    try {
      await updateCopies('Non Existent Book', 5);
    } catch (error) {
      console.log(`  Caught: ${error.message}`);
    }

    // Try invalid category
    console.log('\n❌ Attempting invalid category:');
    try {
      await changeCategory('Sapiens', 'InvalidCategory');
    } catch (error) {
      console.log(`  Caught: ${error.message}`);
    }

    // 5. DELETE OPERATIONS
    console.log('\n5️⃣  DELETE OPERATIONS...');
    
    // First reduce a book to 0 copies
    await updateCopies('A Brief History of Time', -2);
    await deleteBookIfNoCopies('A Brief History of Time');

    // Try to delete book with copies
    console.log('\n❌ Attempting to delete book with copies:');
    try {
      await deleteBookIfNoCopies('Atomic Habits');
    } catch (error) {
      console.log(`  Caught: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✓ DEMO COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n✗ DEMO FAILED:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// ==================== RUN THE DEMO ====================
runDemo();