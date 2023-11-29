const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validationMiddleware = require("../middlewares/validationMiddleware");
const tokenMiddleware = require("../middlewares/tokenMiddleware");
const passport = require("passport");
router.post("/login", validationMiddleware.validateLogin, authController.login);
router.post("/verify-otp", authController.verifyOTP);


router.get(
  "/get/:userId",
  tokenMiddleware.verifyToken,
  authController.getTokenByUserId
);
router.post(
  "/logout/:userId",
  tokenMiddleware.verifyToken,
  authController.logoutUser
);
// social login
// Google OAuth2 login route
router.get("/google", authController.googleLogin);

// Google OAuth2 callback route
router.get("/google/callback", authController.googleLoginCallback);

// Google OAuth2 callback success route
router.get(
  "/google/callback/success",
  authController.googleLoginCallbackSuccess
);

// router.get("/facebook", authController.facebookLogin);

// router.get("/facebook/callback", authController.facebookLoginCallback);
// // facebook callback success route
// router.get(
//   "/facebook/callback/success",
//   authController.facebookLoginCallbackSuccess
// );
module.exports = router;
