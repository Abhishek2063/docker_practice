const User = require("../models/User");
const Token = require("../models/Token"); // Import the Token model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const responseHelper = require("../helpers/response");
const passport = require("passport");
const OTP = require("../models/otp");
const { sendOTPByEmail } = require("../services/sendOTPEmail");

const { JWT_SECRET, FRONTEND_URL } = process.env; // Load the JWT secret from your .env file
// User login and token generation
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json(responseHelper.errorResponse("Invalid credentials."));
    }

    // Check if the password matches the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(responseHelper.errorResponse("Invalid credentials."));
    }

    // Generate and save OTP
    const generatedOTP = generateOTP();
    const savedOTP = await saveOTP(user._id, generatedOTP);
    if (!savedOTP) {
      return res
        .status(401)
        .json(responseHelper.errorResponse("Try Again!!!"));
    }
    // Send OTP via email
    sendOTPByEmail(user.email, generatedOTP);
    res.json(responseHelper.successResponse(savedOTP, "OTP sent for verification."));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Function to generate a 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Function to save OTP in the database
const saveOTP = async (userId, otp) => {
  // Check if a record with the given userId already exists
  const existingOTP = await OTP.findOne({ user_id: userId });
  if (existingOTP) {
    // Update the existing record with the new OTP
    existingOTP.otp = otp;
    existingOTP.isDeleted = false;
    return await existingOTP.save();
  } else {
    // Create a new record if it doesn't exist
    const newOTP = new OTP({
      user_id: userId,
      otp,
      isDeleted: false,
    });

    return await newOTP.save();
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otpId, enteredOTP } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      _id: otpId,
      user_id: userId,
      isDeleted: false,
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json(responseHelper.errorResponse("Invalid OTP or expired."));
    }

    // Check if the entered OTP matches
    if (otpRecord.otp !== enteredOTP) {
      return res.status(401).json(responseHelper.errorResponse("Invalid OTP."));
    }

    // OTP is valid; generate a token
    const token = jwt.sign({ _id: userId }, JWT_SECRET);

    // Update OTP record as used
    otpRecord.isDeleted = true;
    await otpRecord.save();

    // Find the token for the user
    const tokenUpdate = await Token.findOneAndUpdate(
      { user_id: userId, isDeleted: true },
      { isDeleted: false, token },
      { new: true }
    );

    if (tokenUpdate) {
      const user = await User.findById(userId);
      const data = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        token,
        userId,
      };
      res.json(responseHelper.successResponse(data, "Login Successful"));
    } else {
      // Store the token in the database
      const newToken = new Token({
        user_id: userId,
        token,
        is_deleted: false,
      });

      await newToken.save();
      const user = await User.findById(userId);
      const data = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        token,
        userId,
      };
      res.json(responseHelper.successResponse(data, "Login Successful"));
    }
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// Get a token by user ID
exports.getTokenByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Use the Token model to find the token by user_id and populate the user data
    const token = await Token.findOne({
      user_id: userId,
      isDeleted: false,
    }).populate("user_id");

    if (!token) {
      return res
        .status(404)
        .json(responseHelper.errorResponse("Token not found", 404));
    }

    res.json(responseHelper.successResponse(token));
  } catch (error) {
    res.status(500).json(responseHelper.errorResponse(error.message));
  }
};

// logout the user
exports.logoutUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the token for the user
    const token = await Token.findOneAndUpdate(
      { user_id: userId, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (token) {
      // Respond with a success message or appropriate status code
      res.json(
        responseHelper.successResponse("", "User logged out successfully")
      );
    } else {
      // Token not found (already logged out or never existed)
      res.status(404).json(responseHelper.errorResponse("", "Token not found"));
    }
  } catch (error) {
    // Handle any errors
    res.status(500).json(responseHelper.errorResponse("", error.message));
  }
};

// social login
// via google
exports.googleLogin = async (req, res) => {
  try {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
  } catch (error) {
    // Handle any errors
    res.status(500).json(responseHelper.errorResponse("", error.message));
  }
};
// Google OAuth2 callback route
exports.googleLoginCallback = (req, res, next) => {
  passport.authenticate("google", {
    failureMessage: "Cannot login to Google, please try again later!",
    failureRedirect: `${FRONTEND_URL}/auth/login/error`,
    successRedirect: `${FRONTEND_URL}/auth/login/success`,
  })(req, res, () => {
    // After successful authentication, store user data in the session
    req.session.user = req.user;
    res.send("Thank you for signing in!");
  });
};

exports.googleLoginCallbackSuccess = async (req, res) => {
  try {
    const userData = req.user;
    const token = await Token.findOne({
      user_id: userData._id,
      isDeleted: false,
    }).populate("user_id");
    const data = {
      email: token.user_id.email,
      first_name: token.user_id.first_name,
      last_name: token.user_id.last_name,
      token: token.token,
      userId: token.user_id._id,
    };
    if (!userData) {
      // Handle the case where user data is not found in the session
      return res
        .status(401)
        .json(responseHelper.errorResponse("User data not found"));
    }

    // Send the user data as a response
    return res
      .status(200)
      .json(responseHelper.successResponse(data, "Login successfully"));
  } catch (error) {
    // Handle any errors
    res.status(500).json(responseHelper.errorResponse("", error.message));
  }
};

// via facebook
exports.facebookLogin = (req, res) => {
  // Start the Facebook authentication by redirecting to Facebook's authentication page
  passport.authenticate("facebook", {
    authType: "reauthenticate",
    scope: ["user_friends", "manage_pages"],
  })(req, res);
};

exports.facebookLoginCallback = (req, res, next) => {
  passport.authenticate("facebook", {
    failureMessage: "Cannot login to Facebook, please try again later!",
    failureRedirect: `${FRONTEND_URL}/auth/login/error`,
    successRedirect: `${FRONTEND_URL}/auth/login/success`,
  })(req, res, next);
};

exports.facebookLoginCallbackSuccess = async (req, res) => {
  try {
    const userData = req.user;
    const token = await Token.findOne({
      user_id: userData._id,
      isDeleted: false,
    }).populate("user_id");
    const data = {
      email: token.user_id.email,
      first_name: token.user_id.first_name,
      last_name: token.user_id.last_name,
      token: token.token,
      userId: token.user_id._id,
    };
    if (!userData) {
      // Handle the case where user data is not found in the session
      return res
        .status(401)
        .json(responseHelper.errorResponse("User data not found"));
    }

    // Send the user data as a response
    return res
      .status(200)
      .json(responseHelper.successResponse(data, "Login successfully"));
  } catch (error) {
    // Handle any errors
    res.status(500).json(responseHelper.errorResponse("", error.message));
  }
};
