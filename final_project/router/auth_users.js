const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // get registered user with given username
  const registeredUsers = users.filter((user) => user.username === username);
  // return boolean according to the user availability
  return registeredUsers.length ? true : false;
};

const authenticatedUser = (username, password) => {
  // if user not registered then return false
  if (!isValid(username)) return false;

  const validUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return validUsers.length ? true : false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  // Getting username and password from request body
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({
      message:
        "Unable to login user either username or password is not provided.",
    });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Getting review from the request query
  const review = req.query.review;
  // Getting username from the request session
  const username = req.session.authorization.username;

  // Get the book reviews for the book from booksdb using the isbn given in req parameter
  const isbn = req.params.isbn;
  let bookData = books[isbn];

  // Check if the user already gave review for the book
  if (bookData.reviews[username]) {
    // assign new review to already given review
    bookData.reviews[username] = review;
  } else {
    // add a new review with the username
    userReview = {};
    userReview[username] = review;
    Object.assign(bookData.reviews, userReview);
  }
  return res.status(200).json(bookData);
});

// Deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Getting username from the request session
  const username = req.session.authorization.username;

  // Get the book reviews for the book from booksdb using the isbn given in req parameter
  const isbn = req.params.isbn;
  let bookData = books[isbn];

  // Get the review written by the user and delete it other wise send error message
  if (bookData.reviews[username]) {
    delete bookData.reviews[username];
    return res
      .status(200)
      .json({ message: "The review has been deleted successfully" });
  }

  return res
    .status(401)
    .json({ message: "You didn't give any review yet to this book" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
