// routes/budgetRoutes.js
const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const tokenMiddleware = require("../middlewares/tokenMiddleware");

// Create a new budget
router.post("/create", tokenMiddleware.verifyToken, budgetController.createBudget);

// Get budget list by user ID with pagination
router.get("/list/:userId", tokenMiddleware.verifyToken, budgetController.getBudgetList);

// Update a budget by user ID and budget ID
router.put("/update/:userId/:budgetId", tokenMiddleware.verifyToken, budgetController.updateBudget);

// Soft delete a budget by user ID and budget ID
router.delete("/delete/:userId/:budgetId", tokenMiddleware.verifyToken, budgetController.softDeleteBudget);

module.exports = router;
