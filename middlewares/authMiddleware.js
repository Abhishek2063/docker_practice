const responseHelper = require('../helpers/response');
const { body, validationResult } = require('express-validator');


// Validation middleware for creating a user
exports.validateUserCreate = [
  body('first_name').isString().isLength({ min: 1, max: 20 }).withMessage('First name must be a string (1-20 characters)'),
  body('last_name').isString().isLength({ min: 1, max: 20 }).withMessage('Last name must be a string (1-20 characters)'),
  body('email').isEmail().isLength({ max: 100 }).withMessage('Email must be a valid email address (max 100 characters)'),
  body('password').isString().isLength({ min: 6, max: 100 }).withMessage('Password must be a string (6-100 characters)'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(responseHelper.errorResponse(errors.array()));
    }
    next();
  },
];
