const ExpanseDetail = require("../models/ExpanseDetails");
const responseHelper = require("../helpers/response");
const Category = require("../models/Category");
const excelService = require("../services/excelService");
const path = require("path"); // Add this import for file extension check
// Create an expanse detail
exports.createExpanseDetail = async (req, res) => {
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

    const newExpanseDetail = new ExpanseDetail({
      user_id,
      date,
      description,
      category_id,
      amount,
    });
    await newExpanseDetail.save();

    res.json(
      responseHelper.successResponse("", "Expanse detail created successfully.")
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Get expanse details by user ID
exports.getExpanseDetailsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default to 1 if not specified)
    const limit = parseInt(req.query.limit) || 10; // Get the limit from the query parameters (default to 10 if not specified)

    // Calculate the number of records to skip based on the page and limit
    const skip = (page - 1) * limit;

    // Query the database with pagination and sorting
    const [expanseDetails, totalRecords] = await Promise.all([
      ExpanseDetail.find({ user_id: userId, isDeleted: false })
        .populate("category_id")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      ExpanseDetail.countDocuments({ user_id: userId, isDeleted: false }),
    ]);
    // Calculate the total number of pages based on total records and limit
    const totalPages = Math.ceil(totalRecords / limit);
    // Prepare the response data
    const response = {
      limit,
      page,
      totalRecords,
      totalPages,
      recordsList: expanseDetails,
    };

    res.json(
      responseHelper.successResponse(
        response,
        "Expanse data successfully fetched."
      )
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Update an expanse detail by user ID and expense ID
exports.updateExpanseDetail = async (req, res) => {
  try {
    const { userId, expenseId } = req.params;
    let { date, description, category_id, amount, other_category } = req.body;

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
    if (category_id) updatedFields.category_id = category_id;
    if (amount) updatedFields.amount = amount;

    const expanseDetail = await ExpanseDetail.findOneAndUpdate(
      { user_id: userId, _id: expenseId, isDeleted: false },
      updatedFields,
      { new: true }
    );

    if (!expanseDetail) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("Expanse detail not found", 404));
    }

    res.json(
      responseHelper.successResponse(
        expanseDetail,
        "Expanse detail updated successfully"
      )
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Soft delete an expanse detail by user ID and expense ID
exports.softDeleteExpanseDetail = async (req, res) => {
  try {
    const { userId, expenseId } = req.params;
    const expanseDetail = await ExpanseDetail.findOne({
      user_id: userId,
      _id: expenseId,
      isDeleted: false,
    });
    if (!expanseDetail) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("Expanse detail not found", 404));
    }
    expanseDetail.isDeleted = true;
    await expanseDetail.save();
    res.json(
      responseHelper.successResponse("", "Expanse detail deleted successfully.")
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// import excel file
exports.importExpanseDetail = async (req, res) => {
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
    await excelService.importExcelData(user_id, fileBuffer);
    res.json(responseHelper.successResponse("", "Data imported  from Excel."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};
