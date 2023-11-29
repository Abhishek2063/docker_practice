const mongoose = require("mongoose");

const Category = require("../models/Category");
const User = require("../models/User");
const Token = require("../models/Token");
const IncomeDetails = require("../models/IncomeDetails");
const ExpanseDetails = require("../models/ExpanseDetails");
const BudgetDetails = require("../models/Budget");


const createUsersTable = async () => {
  try {
    if (mongoose.models.User) {
    } else {
      await User.createCollection();
    }
  } catch (error) {
    console.error("Error creating the user table:", error);
  }
};

const createTokenTable = async () => {
  try {
    if (mongoose.models.Token) {
    } else {
      await Token.createCollection();
    }
  } catch (error) {
    console.error("Error creating the Token table:", error);
  }
};

const createCategoryTable = async () => {
  try {
    if (mongoose.models.Category) {
    } else {
      await Category.createCollection();
    }
  } catch (error) {
    console.error("Error creating the Category table:", error);
  }
};

const createIncomeDetailTable = async () => {
  try {
    if (mongoose.models.IncomeDetails) {
    } else {
      await IncomeDetails.createCollection();
    }
  } catch (error) {
    console.error("Error creating the IncomeDetails table:", error);
  }
};

const createExpanseDetailsTable = async () => {
  try {
    if (mongoose.models.ExpanseDetails) {
    } else {
      await ExpanseDetails.createCollection();
    }
  } catch (error) {
    console.error("Error creating the ExpanseDetails table:", error);
  }
};

const createBudgetDetailsTable = async () => {
  try {
    if (mongoose.models.BudgetDetails) {
    } else {
      await BudgetDetails.createCollection();
    }
  } catch (error) {
    console.error("Error creating the Budget table:", error);
  }
};

exports.createTables = () => {
  createUsersTable();
  createTokenTable();
  createCategoryTable();
  createIncomeDetailTable();
  createExpanseDetailsTable();
  createBudgetDetailsTable();
};
