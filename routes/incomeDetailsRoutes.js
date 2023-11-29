const express = require("express");
const router = express.Router();
const incomeDetailsController = require("../controllers/incomeDetailsController");
const validationMiddleware = require("../middlewares/validationMiddleware");
const tokenMiddleware = require("../middlewares/tokenMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post(
  "/create",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateIncomeDetailsCreate,
  incomeDetailsController.createIncomeDetails
);
router.get(
  "/list/:userId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateIncomeDetailsCheck,
  incomeDetailsController.getIncomeDetailsByUserId
);
router.put(
  "/update/:userId/:incomeId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateIncomeDetailsCheck,
  validationMiddleware.validateIncomeDetailsUpdate,
  incomeDetailsController.updateIncomeDetails
);
router.delete(
  "/delete/:userId/:incomeId",
  tokenMiddleware.verifyToken,
  validationMiddleware.validateIncomeDetailsCheck,
  incomeDetailsController.softDeleteIncomeDetails
);

// import excel income file
router.post(
  "/income-data-import/:user_id",
  tokenMiddleware.verifyToken,
  upload.single("file"),
  incomeDetailsController.importIncomeDetail
);

module.exports = router;
