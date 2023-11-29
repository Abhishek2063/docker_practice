const IncomeDetails = require("../models/IncomeDetails");
const responseHelper = require("../helpers/response");
const Category = require("../models/Category");
const incomeExcelServices = require("../services/incomeExcelServices");
const path = require("path"); // Add this import for file extension check

// Create income details
exports.createIncomeDetails = async (req, res) => {
  try {
    let { user_id, date, description, amount, category_id, other_category } =
      req.body;

    // Handle other_category (if provided)
    if (other_category) {
      // Create a new category with user-provided details
      const { category_name, category_type, category_description } =
        other_category;
      // Create the new category here and store the category_id

      const newCategory = new Category({
        user_id,
        category_name,
        category_type,
        description: category_description,
      });
      const savedCategory = await newCategory.save();
      category_id = savedCategory._id;
    }

    const newIncomeDetails = new IncomeDetails({
      user_id,
      date,
      description,
      category_id,
      amount,
    });
    await newIncomeDetails.save();

    res.json(
      responseHelper.successResponse("", "Income details created successfully.")
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Get income details by user ID with pagination
exports.getIncomeDetailsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default to 1 if not specified)
    const limit = parseInt(req.query.limit) || 10; // Get the limit from the query parameters (default to 10 if not specified)

    // Calculate the number of records to skip based on the page and limit
    const skip = (page - 1) * limit;

    // Query the database with pagination and sorting
    const [incomeDetails, totalRecords] = await Promise.all([
      IncomeDetails.find({ user_id: userId, isDeleted: false })
        .populate("category_id")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      IncomeDetails.countDocuments({ user_id: userId, isDeleted: false }),
    ]);
    // Calculate the total number of pages based on total records and limit
    const totalPages = Math.ceil(totalRecords / limit);
    // Prepare the response data
    const response = {
      limit,
      page,
      totalRecords,
      totalPages,
      recordsList: incomeDetails,
    };

    res.json(
      responseHelper.successResponse(
        response,
        "Income data successfully fetched."
      )
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Update income details by user ID and income ID
exports.updateIncomeDetails = async (req, res) => {
  try {
    const { userId, incomeId } = req.params;
    let { date, description, amount, category_id, other_category } = req.body;
    // Handle other_category (if provided)
    if (other_category) {
      // Create a new category with user-provided details
      const { category_name, category_type, category_description } =
        other_category;
      // Create the new category here and store the category_id

      const newCategory = new Category({
        user_id: userId,
        category_name,
        category_type,
        category_description,
      });
      const savedCategory = await newCategory.save();
      category_id = savedCategory._id;
    }
    // Update only the specified fields
    const updatedFields = {};
    if (date) updatedFields.date = date;
    if (description) updatedFields.description = description;
    if (amount) updatedFields.amount = amount;
    if (category_id) updatedFields.category_id = category_id;

    const incomeDetails = await IncomeDetails.findOneAndUpdate(
      { user_id: userId, _id: incomeId, isDeleted: false },
      updatedFields,
      { new: true }
    );

    if (!incomeDetails) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("Income details not found", 404));
    }

    res.json(
      responseHelper.successResponse(
        incomeDetails,
        "Income details updated successfully"
      )
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Soft delete income details by user ID and income ID
exports.softDeleteIncomeDetails = async (req, res) => {
  try {
    const { userId, incomeId } = req.params;
    const incomeDetails = await IncomeDetails.findOne({
      user_id: userId,
      _id: incomeId,
      isDeleted: false,
    });

    if (!incomeDetails) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("Income details not found", 404));
    }

    incomeDetails.isDeleted = true;
    await incomeDetails.save();

    res.json(
      responseHelper.successResponse("","Income details deleted successfully.")
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// import excel file
exports.importIncomeDetail = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!req.file) {
      return res
        .status(400)
        .json(responseHelper.errorResponse("No file uploaded."));
    }
    if (req.file.size === 0) {
      return res
        .status(400)
        .json(responseHelper.errorResponse("Empty file uploaded."));
    }
    // Check the file extension to allow xlsx, xlx, and ods formats
    const allowedExtensions = [".xlsx", ".xlx"];
    const fileExtension = path.extname(req.file.originalname);
    if (!allowedExtensions.includes(fileExtension)) {
      return res
        .status(400)
        .json(responseHelper.errorResponse("Invalid file format."));
    }
    const fileBuffer = req.file.buffer;
    await incomeExcelServices.importExcelData(user_id, fileBuffer);
    res.json(responseHelper.successResponse("", "Data imported  from Excel."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};