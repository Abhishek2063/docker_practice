// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get(
  "/getToalIncomeExpanse/:userId",
  dashboardController.getToalIncomeExpanse
);
router.get(
  "/getExpenseByCategory/:userId",
  dashboardController.getExpenseByCategory
);
router.get(
  "/getIncomeExpenseSummary/:userId",
  dashboardController.getIncomeExpenseSummary
);
router.get("/getExpenseDays/:userId", dashboardController.getExpenseDays);
module.exports = router;
