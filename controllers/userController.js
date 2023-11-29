const User = require("../models/User");
const bcrypt = require("bcrypt");
const responseHelper = require("../helpers/response");
const { sendWelcomeEmail } = require("../services/emailService");

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json(responseHelper.errorResponse("Email already exists."));
    }

    // Hash the password before saving it to the database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    // Use `${first_name} ${last_name}` to properly concatenate the names
    await sendWelcomeEmail(email, `${first_name} ${last_name}`, password);
    res.json(responseHelper.successResponse("","User created successfully and email sent to mentioned email."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Read user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("User not found", 404));
    }
    res.json(responseHelper.successResponse(user));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { first_name, last_name, email } = req.body;

    // Update only the specified fields
    const updatedFields = {};
    if (first_name) updatedFields.first_name = first_name;
    if (last_name) updatedFields.last_name = last_name;
    if (email) updatedFields.email = email;

    const user = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    if (!user) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("User not found", 404));
    }

    res.json(responseHelper.successResponse(user));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Soft delete user by ID
exports.softDeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("User not found", 404));
    }

    res.json(responseHelper.successResponse("User deleted successfully."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};
