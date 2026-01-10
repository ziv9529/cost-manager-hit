const express = require("express");
const router = express.Router();

const User = require("../models/user");

// Create a new user
router.post("/add", function (req, res) {
  // Extract all parameters from the request body
  const { id, first_name, last_name, birthday } = req.body;

  // Validation: Check if any required field is missing from the request body
  if (!id || !first_name || !last_name || !birthday) {
    return res.status(500).json({
      id: id,
      message:
        "Missing some required parameters (id, first_name, last_name, birthday)",
    });
  }

  const userBirthday = new Date(birthday);

  // Validation: Ensure the birthday is not in the future
  if (userBirthday > new Date()) {
    return res
      .status(500)
      .json({ id: id, message: "Birthday date can't be in the future" });
  }

  // Query the database to verify that the user doesn't already exist
  User.findOne({ id: id })
    .then((userExists) => {
      // If the user is found, throw an error to skip to the catch block
      if (userExists) {
        throw new Error("User already exists");
      }

      // Create a new user document in the database
      return User.create({
        id,
        first_name,
        last_name,
        birthday: userBirthday,
      });
    })
    .then((user) => {
      // If creation is successful, send the created user object back to the client
      // Convert to plain object and exclude _id field
      const userObj = user.toObject();
      delete userObj._id;
      res.status(200).send(userObj);
    })
    .catch((error) => {
      // Catch any errors (user find failed or others) and return a 500 error
      res.status(500).json({ id: id, message: error.message });
    });
});

router.get("/users", function (req, res) {
  try {
    // Query the database to get all users
    User.find({})
      .then((users) => {
        // Send the list of users back to the client (exclude _id field)
        const usersWithoutId = users.map((user) => {
          const userObj = user.toObject();
          delete userObj._id;
          return userObj;
        });
        res.status(200).send(usersWithoutId);
      })
      .catch((error) => {
        // Catch any errors and return a 500 error
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    // Catch any errors and return a 500 error
    res.status(500).json({ message: error.message });
  }
});

// Retrieve a specific user by id
router.get("/users/:id", function (req, res) {
  // Extract the user ID from the URL parameters
  const { id } = req.params;

  // Query the database to find the user by ID
  User.findOne({ id: id })
    .then((user) => {
      // If the user is not found, throw an error to skip to the catch block
      if (!user) {
        throw new Error("User not found");
      }

      // Send the user details back to the client
      res.status(200).json({
        first_name: user.first_name,
        last_name: user.last_name,
        id: user.id,
        birthday: user.birthday,
      });
    })
    .catch((error) => {
      // Catch any errors and return a 500 error with id and message
      res.status(500).json({ id: id, message: error.message });
    });
});

module.exports = router;
