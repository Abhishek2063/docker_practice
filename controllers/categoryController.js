const Category = require('../models/Category');
const responseHelper = require('../helpers/response');

// Create a category
exports.createCategory = async (req, res) => {
  try {
    const { user_id, category_name,description,category_type } = req.body;
    const newCategory = new Category({ user_id, category_name,description,category_type });
    await newCategory.save();
    res.json(responseHelper.successResponse("",'Category created successfully.'));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Get a list of categories by user ID
exports.getCategoriesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default to 1 if not specified)
    const limit = parseInt(req.query.limit) || 10; // Get the limit from the query parameters (default to 10 if not specified)

    // Calculate the number of records to skip based on the page and limit
    const skip = (page - 1) * limit;

    // Query the database with pagination and sorting
    const [categoryDetails, totalRecords] = await Promise.all([
      Category.find({ user_id: userId, isDeleted: false })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
        Category.countDocuments({ user_id: userId, isDeleted: false }),
    ]);
    // Calculate the total number of pages based on total records and limit
    const totalPages = Math.ceil(totalRecords / limit);
    // Prepare the response data
    const response = {
      limit,
      page,
      totalRecords,
      totalPages,
      recordsList: categoryDetails,
    };

    res.json(
      responseHelper.successResponse(
        response,
        "Category data successfully fetched."
      )
    );
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Get a category by user ID and category ID
exports.getCategoryByUserIdAndId = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    const category = await Category.findOne({ user_id: userId, _id: categoryId, isDeleted: false });
    if (!category) {
      return res.status(404).json(responseHelper.errorResponse('Category not found', 404));
    }
    res.json(responseHelper.successResponse(category));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Get a list of categories by category_type and user ID
exports.getCategoriesByTypeAndUserId = async (req, res) => {
    try {
      const { userId, category_type } = req.params;
      const categories = await Category.find({ user_id: userId, category_type, isDeleted: false });
      res.json(responseHelper.successResponse(categories));
    } catch (error) {
      res.status(500).json(responseHelper.errorResponse(error.message));
    }
  };

  
// Update a category by user ID and category ID
exports.updateCategory = async (req, res) => {
    try {
      const { userId, categoryId } = req.params;
      const { category_name, description,category_type } = req.body;
  
      // Update only the specified fields
      const updatedFields = {};
      if (category_name) updatedFields.category_name = category_name;
      if (description) updatedFields.description = description;
      if (category_type) updatedFields.category_type = category_type;
      const category = await Category.findOneAndUpdate(
        { user_id: userId, _id: categoryId, isDeleted: false },
        updatedFields,
        { new: true }
      );
  
      if (!category) {
        return res.status(404).json(responseHelper.errorResponse('Category not found', 404));
      }
  
      res.json(responseHelper.successResponse(category,'Category updated successfully', ));
    } catch (error) {
      res.status(500).json(responseHelper.errorResponse(error.message));
    }
  };
  

// Soft delete a category by user ID and category ID
exports.softDeleteCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;
    const category = await Category.findOne({ user_id: userId, _id: categoryId, isDeleted: false });
    if (!category) {
      return res.status(404).json(responseHelper.errorResponse('Category not found', 404));
    }
    category.isDeleted = true;
    await category.save();
    res.json(responseHelper.successResponse("",'Category deleted successfully.'));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};
