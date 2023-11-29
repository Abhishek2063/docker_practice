const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const validationMiddleware = require("../middlewares/validationMiddleware");
const tokenMiddleware = require("../middlewares/tokenMiddleware");

router.post(
  "/create",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateCategoryCreate,
  categoryController.createCategory
);
router.get(
  "/list/:userId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateCategoryIdCheck,
  categoryController.getCategoriesByUserId
);
router.get(
  "/get/:userId/:categoryId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateCategoryIdCheck,
  categoryController.getCategoryByUserIdAndId
);
router.get(
  "/list/:userId/:category_type",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateCategoryIdCheck,
  validationMiddleware.validateCategoryType,
  categoryController.getCategoriesByTypeAndUserId
);
router.put(
  "/update/:userId/:categoryId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateCategoryUpdate,
  categoryController.updateCategory
);
router.delete(
  "/delete/:userId/:categoryId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateCategoryIdCheck,
  categoryController.softDeleteCategory
);

module.exports = router;
