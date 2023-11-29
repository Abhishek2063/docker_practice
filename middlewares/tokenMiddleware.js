const jwt = require('jsonwebtoken');
const responseHelper = require('../helpers/response');
const { JWT_SECRET } = process.env; // Load the JWT secret from your .env file
const mongoose = require('mongoose');

exports.generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET);
};

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json(responseHelper.errorResponse('Access denied. No token provided.', 401));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json(responseHelper.errorResponse('Invalid token.', 401));
    }
    req.user = user;
    next();
  });
};

