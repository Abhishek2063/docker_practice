const passport = require("passport");
const User = require("../models/User");
const Token = require("../models/Token");
const responseHelper = require("../helpers/response");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const GoogleStrategy = require("passport-google-oauth2").Strategy;
require("dotenv").config(); // Load environment variables from .env
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REACT_APP_LOCAL_API_URL,
  JWT_SECRET,
} = process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${REACT_APP_LOCAL_API_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, cb) => {
      const defaultUser = {
        first_name: `${profile.name.givenName}`,
        last_name: ` ${profile.name.familyName}`,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
        googleId: profile.id,
      };

      // Hash the password before saving it to the database
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("Password@123", saltRounds);

      // Check if the email already exists
      User.findOne({ email: defaultUser.email })
        .then(async (existingUser) => {
          if (existingUser) {
            const token = jwt.sign({ _id: existingUser._id }, JWT_SECRET);
            const tokenUpdate = await Token.findOneAndUpdate(
              { user_id: existingUser._id },
              { isDeleted: false, token },
              { new: true }
            );
            if (tokenUpdate) {
              const data = {
                email: existingUser.email,
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                token: token,
                userId: existingUser._id,
              };

              return cb(null, data); // Call the callback with the user data
            } else {
              // Store the token in the database
              const newToken = new Token({
                user_id: existingUser._id,
                token,
                is_deleted: false,
              });

              await newToken.save();
              const data = {
                email: existingUser.email,
                first_name: existingUser.first_name,
                last_name: existingUser.last_name,
                token: token,
                userId: existingUser._id,
              };

              return cb(null, data); // Call the callback with the user data
            }
          } else {
            const newUser = new User({
              email: defaultUser.email,
              first_name: defaultUser.first_name,
              last_name: defaultUser.last_name,
              image: defaultUser.picture,
              password: hashedPassword,
            });

            await newUser.save();

            const token = jwt.sign({ _id: newUser._id }, JWT_SECRET);
            const newToken = new Token({
              user_id: newUser._id,
              token,
              is_deleted: false,
            });

            await newToken.save();

            const data = {
              email: newUser.email,
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              token: token,
              userId: newUser._id,
            };

            return cb(null, data); // Call the callback with the new user data
          }
        })
        .catch((err) => {
          // Handle any errors
          return cb(err, null); // Call the callback with the error
        });
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser(async (user, cb) => {
  const userData = await User.findById(user.userId).catch((err) => {
    cb(err, null);
  });

  if (userData) {
    cb(null, userData); // Call the callback with the user object
  } else {
    cb(new Error("User not found"), null); // Call the callback with an error if user is not found
  }
});
