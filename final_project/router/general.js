const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  // Getting username and password from request body
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (isValid(username)) {
    return res
      .status(404)
      .json({ message: `User already exists with username ${username} !` });
  }

  users.push({ username: username, password: password });
  return res
    .status(200)
    .json({ message: "User successfully registred. Now you can login" });
});

// Get books using promise
const getBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};
// Get the book list available in the shop
public_users.get("/", function (req, res) {
  getBooks()
    .then((resolvedBooks) =>
      res.status(200).send(JSON.stringify({ Books: resolvedBooks }, null, 4))
    )
    .catch((err) =>
      res.status(400).json({ message: "Error while reading data" })
    );
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  // ISBN from request parameter
  const isbn = req.params.isbn;
  getBooks()
    .then((resolvedBooks) =>
      res
        .status(200)
        .send(JSON.stringify({ Books: resolvedBooks[isbn] }, null, 4))
    )
    .catch((err) =>
      res.status(400).json({ message: "Error while reading data" })
    );
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  // Author from request parameter
  const author = req.params.author;

  getBooks()
    .then((resolvedBooks) => {
      // Take all the keys as array
      const keys = Object.keys(resolvedBooks);
      // Search authors by using keys in arrays to find the matching keys
      const filteredBooksKeys = keys.filter(
        (key) => resolvedBooks[key].author === author
      );
      // Construct new object using the found keys
      let filteredBook = {};
      // Iterate using found keys to get the books and push to filteredBooks
      filteredBooksKeys.forEach((key) => {
        filteredBook[key] = resolvedBooks[key];
      });
      return res
        .status(200)
        .send(JSON.stringify({ Books: filteredBook }, null, 4));
    })
    .catch((err) =>
      res.status(400).json({ message: "Error while reading data" })
    );
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  // Title from request parameter
  const title = req.params.title;
  getBooks().then((resolvedBooks) => {
    // Take all the keys as array
    const keys = Object.keys(resolvedBooks);
    // Search title by using keys in arrays to find the matching keys
    const filteredBooksKeys = keys.filter(
      (key) => resolvedBooks[key].title === title
    );
    // Construct new object using the found keys
    let filteredBook = {};
    // Iterate using found keys to get the books and push to filteredBooks
    filteredBooksKeys.forEach((key) => {
      filteredBook[key] = resolvedBooks[key];
    });
    return res
      .status(200)
      .send(JSON.stringify({ Books: filteredBook }, null, 4));
  });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  // ISBN of the book
  const isbn = req.params.isbn;
  // Take the book for the isbn from books object
  const filteredBook = books[isbn];

  const review = filteredBook.reviews;
  return res.status(200).send(JSON.stringify({ review }, null, 4));
});

module.exports.general = public_users;
