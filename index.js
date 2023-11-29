require("dotenv").config(); // Load environment variables from .env

const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const incomeDetailsRoutes = require("./routes/incomeDetailsRoutes");
const expanseDetailsRoutes = require("./routes/expanseDetailsRoutes");
const budgetDetailsRoutes = require("./routes/budgetRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
require("./config/database"); // Import the database configuration
require("./config/passport");
// require("./config/facebookPassport");
const passport = require("passport");
const session = require("express-session");

// for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Allow requests from 'http://localhost:3000'
const allowedOrigins = [
  process.env.FRONTEND_URL,
  `${process.env.FRONTEND_URL}/*`,
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // If you need to pass credentials (e.g., cookies)
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the Expanse Tracking!");
});

// social media auth enable
app.use(
  session({
    secret: process.env.JWT_SECRET,
    maxAge: 24 * 60 * 60 * 1000,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/income", incomeDetailsRoutes);
app.use("/api/expanse", expanseDetailsRoutes);
app.use("/api/budget", budgetDetailsRoutes);
app.use("/api/dashboard", dashboardRoutes);
// Other routes and configurations

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
