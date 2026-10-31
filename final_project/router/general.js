const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.some(u => u.username === username)) {
        return res.status(409).json({ message: "User already exists!" });
    }
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// All books
public_users.get('/', (req, res) => {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// By ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    if (book) return res.status(200).send(JSON.stringify(book, null, 4));
    return res.status(404).json({ message: "Book not found" });
});

// By author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    const result = Object.keys(books)
        .filter(isbn => books[isbn].author.toLowerCase() === author)
        .map(isbn => ({ isbn, ...books[isbn] }));
    if (result.length) return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
    return res.status(404).json({ message: "No books found for this author" });
});

// By title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    const result = Object.keys(books)
        .filter(isbn => books[isbn].title.toLowerCase() === title)
        .map(isbn => ({ isbn, ...books[isbn] }));
    if (result.length) return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
    return res.status(404).json({ message: "No books found with this title" });
});

// Reviews
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    if (book) return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    return res.status(404).json({ message: "Book not found" });
});

// ---------- Axios client functions (Task 11) ----------

// All books - async/await
async function getAllBooks() {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching books:", error.message);
    }
}

// By ISBN - Promise callbacks
function getBookByISBN(isbn) {
    return axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then(response => response.data)
        .catch(error => console.error("Error fetching by ISBN:", error.message));
}

// By author - async/await
async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching by author:", error.message);
    }
}

// By title - Promise callbacks
function getBooksByTitle(title) {
    return axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
        .then(response => response.data)
        .catch(error => console.error("Error fetching by title:", error.message));
}

// Routes that use the Axios functions above
public_users.get('/axios/books', async (req, res) => res.json(await getAllBooks()));
public_users.get('/axios/isbn/:isbn', (req, res) => getBookByISBN(req.params.isbn).then(d => res.json(d)));
public_users.get('/axios/author/:author', async (req, res) => res.json(await getBooksByAuthor(req.params.author)));
public_users.get('/axios/title/:title', (req, res) => getBooksByTitle(req.params.title).then(d => res.json(d)));

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;