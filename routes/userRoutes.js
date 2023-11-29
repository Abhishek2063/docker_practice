const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new user
router.post(
  "/create",
  authMiddleware.validateUserCreate,
  userController.createUser
);

// Read a user by ID
router.get("/:id", userController.getUserById);

// Update a user by ID
router.put("/:id", userController.updateUser);

// Soft delete a user by ID
router.delete("/:id", userController.softDeleteUser);

module.exports = router;
