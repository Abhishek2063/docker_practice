const express = require("express");
const router = express.Router();
const expanseDetailsController = require("../controllers/expanseDetailsController");
const validationMiddleware = require("../middlewares/validationMiddleware");
const tokenMiddleware = require("../middlewares/tokenMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new expanse detail
router.post(
  "/create",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateExpanseDetailsCreate,
  expanseDetailsController.createExpanseDetail
);

// Get expanse details by user ID
router.get(
  "/list/:userId",
  tokenMiddleware.verifyToken,
  expanseDetailsController.getExpanseDetailsByUserId
);

// Update an expanse detail by user ID and expense ID
router.put(
  "/update/:userId/:expenseId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateExpanseDetailsUpdate,
  expanseDetailsController.updateExpanseDetail
);

// Soft delete an expanse detail by user ID and expense ID
router.delete(
  "/delete/:userId/:expenseId",
  tokenMiddleware.verifyToken,
  expanseDetailsController.softDeleteExpanseDetail
);

// import excel expanse file
router.post(
  "/expanse-data-import/:user_id",
  tokenMiddleware.verifyToken,
  upload.single("file"),
  expanseDetailsController.importExpanseDetail
);

module.exports = router;
