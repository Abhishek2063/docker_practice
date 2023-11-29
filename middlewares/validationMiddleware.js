const { body, validationResult, param } = require('express-validator');

// login validation
exports.validateLogin = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(responseHelper.errorResponse(errors.array()));
    }
    next();
  },
];

// category related validation
exports.validateCategoryCreate = [
  body('user_id').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  body('category_name').isString().isLength({ max: 30 }).withMessage('Category name must be a string (max 30 characters)'),
  body('description').optional().isString().isLength({ max: 100 }).withMessage('Category description must be a string (max 100 characters)'),

  // Add validation for category_type
  body('category_type').isIn(['income', 'expense', 'debit', 'credit']).withMessage('Invalid category_type'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateCategoryUpdate = [
  param('userId').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  param('categoryId').isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
  body('category_name').optional().isString().isLength({ max: 30 }).withMessage('Category name must be a string (max 30 characters)'),
  body('description').optional().isString().isLength({ max: 100 }).withMessage('Category description must be a string (max 100 characters)'),

  // Add validation for category_type
  body('category_type').optional().isIn(['income', 'expense', 'debit', 'credit']).withMessage('Invalid category_type'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
exports.validateCategoryIdCheck= [
  param('userId').optional().isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  param('categoryId').optional().isMongoId().withMessage('category ID must be a valid MongoDB ID'),
 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
exports.validateCategoryType = (req, res, next) => {
  const validTypes = ['income', 'expense', 'debit', 'credit'];
  if (!validTypes.includes(req.params.category_type)) {
    return res.status(400).json({ error: 'Invalid category_type' });
  }
  next();
};

// income details related validation
exports.validateIncomeDetailsCreate = [
  body('user_id').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('description').optional().isString().isLength({ max: 100 }).withMessage('Description must be a string (max 100 characters)'),
  body('amount').isNumeric().withMessage('Amount must be a valid number'),
  body('category_id').optional().isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
  body('other_category').optional().isObject().withMessage('Other category must be an object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateIncomeDetailsUpdate = [
  param('userId').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  param('incomeId').isMongoId().withMessage('Income ID must be a valid MongoDB ID'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().isString().isLength({ max: 100 }).withMessage('Description must be a string (max 100 characters)'),
  body('amount').optional().isNumeric().withMessage('Amount must be a valid number'),
  body('category_id').optional().isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateIncomeDetailsCheck= [
  param('userId').optional().isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  param('incomeId').optional().isMongoId().withMessage('Income ID must be a valid MongoDB ID'),
 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


// expnase details

exports.validateExpanseDetailsCreate = [
  body('user_id').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('description').optional().isString().isLength({ max: 100 }).withMessage('Description must be a string (max 100 characters)'),
  body('amount').isNumeric().withMessage('Amount must be a valid number'),
  body('category_id').optional().isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
  body('other_category').optional().isObject().withMessage('Other category must be an object'),
 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateExpanseDetailsUpdate = [
  param('userId').isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  param('expenseId').isMongoId().withMessage('Expense ID must be a valid MongoDB ID'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().isString().isLength({ max: 100 }).withMessage('Description must be a string (max 100 characters)'),
  body('amount').optional().isNumeric().withMessage('Amount must be a valid number'),
 body('amount').optional().isNumeric().withMessage('Amount must be a valid number'),
  body('category_id').optional().isMongoId().withMessage('Category ID must be a valid MongoDB ID'),
 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateIncomeDetailsCheck= [
  param('userId').optional().isMongoId().withMessage('User ID must be a valid MongoDB ID'),
  param('expenseId').optional().isMongoId().withMessage('Income ID must be a valid MongoDB ID'),
 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
