// controllers/dashboardController.js
const ExpanseDetail = require("../models/ExpanseDetails");
const IncomeDetails = require("../models/IncomeDetails");
const responseHelper = require("../helpers/response");
const Category = require("../models/Category");
const { default: mongoose } = require("mongoose");
exports.getToalIncomeExpanse = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const startDate = req.query.startDate
      ? new Date(req.query.startDate).toISOString()
      : firstDayOfMonth.toISOString();

    const endDate = req.query.endDate
      ? new Date(req.query.endDate).toISOString()
      : lastDayOfMonth.toISOString();

    // Calculate total income for the specified date range
    const totalIncome = await IncomeDetails.aggregate([
      {
        $match: {
          $and: [
            { user_id: userId },
            { isDeleted: false },
            { date: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    // Calculate total expense for the specified date range
    const totalExpense = await ExpanseDetail.aggregate([
      {
        $match: {
          $and: [
            { user_id: userId },
            { isDeleted: false },
            { date: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    let totalIncomeData = totalIncome.length > 0 ? totalIncome[0].total : 0;
    let totalExpenseData = totalExpense.length > 0 ? totalExpense[0].total : 0;
    // Calculate left income
    const leftIncome = totalIncomeData - totalExpenseData;

    // Prepare response with proper title and formatted data
    const response = [
      ["Category", "Amount (in Rupee)"],
      ["Expense", totalExpense.length > 0 ? totalExpense[0].total : 0],
      ["Income Left", leftIncome],
    ];
    res.json(
      responseHelper.successResponse(
        response,
        "Total Income Over Toal Expanse Data fetch."
      )
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(responseHelper.errorResponse({ error: "Internal Server Error" }));
  }
};

exports.getExpenseByCategory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const startDate = req.query.startDate
      ? new Date(req.query.startDate).toISOString()
      : firstDayOfMonth.toISOString();

    const endDate = req.query.endDate
      ? new Date(req.query.endDate).toISOString()
      : lastDayOfMonth.toISOString();

    // Calculate expense by category for the specified date range
    const expenseByCategory = await ExpanseDetail.aggregate([
      {
        $match: {
          $and: [
            { user_id: userId },
            { isDeleted: false },
            { date: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: "$category_id",
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories", // Assuming your collection name is 'categories'
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          _id: "$category._id",
          category_name: "$category.category_name",
          total: 1,
        },
      },
    ]);

    // Prepare response with proper title and formatted data
    const response = [["Category Name", "Amount (in Rupee)"]];
    expenseByCategory.forEach((category) => {
      response.push([category.category_name, category.total]);
    });

    res.json(
      responseHelper.successResponse(
        response,
        "Expense Data by Category fetched."
      )
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(responseHelper.errorResponse({ error: "Internal Server Error" }));
  }
};

exports.getIncomeExpenseSummary = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const queryType = req.query.type || "monthly";

    let startDate, endDate;

    if (queryType === "monthly") {
      // Monthly: Data for Jan, Feb, ..., Dec of the current year
      startDate = new Date(currentYear, 0, 1).toISOString();
      endDate = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();
    } else if (queryType === "yearly") {
      // Yearly: Data for the last 5 years from the current year
      startDate = new Date(currentYear - 5, 0, 1).toISOString();
      endDate = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();
    } else {
      res
        .status(400)
        .json(responseHelper.errorResponse({ error: "Invalid query type" }));
      return;
    }

    // Calculate total income for the specified date range
    const totalIncome = await IncomeDetails.aggregate([
      {
        $match: {
          user_id: userId,
          isDeleted: false,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id:
            queryType === "yearly" ? { $year: "$date" } : { $month: "$date" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate total expense for the specified date range
    const totalExpense = await ExpanseDetail.aggregate([
      {
        $match: {
          user_id: userId,
          isDeleted: false,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id:
            queryType === "yearly" ? { $year: "$date" } : { $month: "$date" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Prepare response with proper title and formatted data
    const response = [
      [queryType === "yearly" ? "Year" : "Month", "Income", "Expenses"],
    ];

    if (queryType === "yearly") {
      for (let i = 0; i <= 5; i++) {
        const year = currentYear - i;
        const matchingIncome = totalIncome.find(
          (income) => income._id === year
        );
        const matchingExpense = totalExpense.find(
          (expense) => expense._id === year
        );
        response.push([
          `${year}`,
          matchingIncome ? matchingIncome.total || 0 : 0,
          matchingExpense ? matchingExpense.total || 0 : 0,
        ]);
      }
    } else {
      // Merge income and expense data based on the common _id (month or year)
      for (let i = 1; i <= 12; i++) {
        const matchingIncome = totalIncome.find((income) => income._id === i);
        const matchingExpense = totalExpense.find(
          (expense) => expense._id === i
        );
        response.push([
          getMonthName(i),
          matchingIncome ? matchingIncome.total || 0 : 0,
          matchingExpense ? matchingExpense.total || 0 : 0,
        ]);
      }
    }

    res.json(
      responseHelper.successResponse(
        response,
        "Income and Expense Summary fetched."
      )
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(responseHelper.errorResponse({ error: "Internal Server Error" }));
  }
};

// Helper function to get the name of the month
function getMonthName(month) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[month - 1];
}

exports.getExpenseDays = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Month is 0-based, so we add 1
    const queryMonth = req.query.month || currentMonth;

    // Calculate the first and last day of the specified month
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      queryMonth - 1,
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      queryMonth,
      0,
      23,
      59,
      59
    );

    // Calculate total expense for each day in the specified month
    const expenseDays = await ExpanseDetail.aggregate([
      {
        $match: {
          user_id: userId,
          isDeleted: false,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          total: { $sum: "$amount" },
        },
      },
    ]);
    // Prepare response with proper title and formatted data
    const response = [["Days", "Expenses"]];

    // Initialize array with 0 values for each day of the month
    const daysArray = Array.from(
      { length: new Date(currentDate.getFullYear(), queryMonth, 0).getDate() },
      (_, index) => index + 1
    );
    daysArray.forEach((day) => {
      const matchingExpense = expenseDays.find((expense) => {
        return expense._id === day;
      });
      response.push([day, matchingExpense ? matchingExpense.total || 0 : 0]);
    });

    res.json(
      responseHelper.successResponse(
        response,
        "Expense Data Days-wise fetched."
      )
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(responseHelper.errorResponse({ error: "Internal Server Error" }));
  }
};
