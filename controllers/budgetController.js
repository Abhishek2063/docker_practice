// controllers/budgetController.js
const Budget = require("../models/Budget");
const responseHelper = require("../helpers/response");

exports.createBudget = async (req, res) => {
  try {
    const { user_id, start_date, end_date, amount } = req.body;
    const newBudget = new Budget({ user_id, start_date, end_date, amount });
    await newBudget.save();
    res.json(responseHelper.successResponse("", "Budget created successfully."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

exports.getBudgetList = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [budgetList, totalRecords] = await Promise.all([
      Budget.find({ user_id: userId, isDeleted: false })
        .sort({ start_date: 1 }) // Adjust sorting as needed
        .skip(skip)
        .limit(limit),
      Budget.countDocuments({ user_id: userId, isDeleted: false }),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);
    const response = {
      limit,
      page,
      totalRecords,
      totalPages,
      recordsList: budgetList,
    };

    res.json(responseHelper.successResponse(response, "Budget data fetched successfully."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { userId, budgetId } = req.params;
    const { start_date, end_date, amount } = req.body;

    const updatedFields = {};
    if (start_date) updatedFields.start_date = start_date;
    if (end_date) updatedFields.end_date = end_date;
    if (amount) updatedFields.amount = amount;

    const budget = await Budget.findOneAndUpdate(
      { user_id: userId, _id: budgetId, isDeleted: false },
      updatedFields,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json(responseHelper.errorResponse("Budget not found", 404));
    }

    res.json(responseHelper.successResponse(budget, "Budget updated successfully"));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

exports.softDeleteBudget = async (req, res) => {
  try {
    const { userId, budgetId } = req.params;
    const budget = await Budget.findOne({
      user_id: userId,
      _id: budgetId,
      isDeleted: false,
    });

    if (!budget) {
      return res.status(404).json(responseHelper.errorResponse("Budget not found", 404));
    }

    budget.isDeleted = true;
    await budget.save();

    res.json(responseHelper.successResponse("", "Budget deleted successfully."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};
