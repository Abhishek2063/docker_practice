const xlsx = require("xlsx");
const Category = require("../models/Category");
const IncomeDetails = require("../models/IncomeDetails");

/**
 * Imports data from an Excel file and inserts it into the database in bulk.
 * @param {string} userId - The user ID associated with the imported data.
 * @param {Buffer} fileBuffer - The Excel file buffer containing the data.
 */
async function importExcelData(userId, fileBuffer) {
  // Read the Excel file using xlsx
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });

  // Assuming reading the first sheet
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Convert sheet to JSON
  const jsonData = xlsx.utils.sheet_to_json(sheet, {
    raw: false,
    dateNF: "yyyy-mm-dd h:mm:ss",
  });

  // Check if the sheet contains only headings (no actual data)
  if (jsonData.length <= 0) {
    throw new Error("The Excel file does not contain any data.");
  }

  // Start a session for transaction
  const session = await IncomeDetails.startSession();
  session.startTransaction({
    defaultTransactionOptions: {
      maxTimeMS: 60000 * 1000000 * 98798989997, // Set your desired transaction time in milliseconds
    },
  });

  try {
    // Array to store data for bulk insertion
    const bulkInsertData = [];

    // Iterate through each row in the Excel data
    for (let i = 0; i < jsonData.length; i++) {
      const currentDateObj = new Date(jsonData[i].Date);
      var numberOfMlSeconds = currentDateObj.getTime();
      let addMlSeconds = 6 * 60 * 60 * 1000 + 30 * 60 * 1000;
      const date = new Date(numberOfMlSeconds + addMlSeconds);
      const amount = jsonData[i].Amount;
      const description = jsonData[i].Description;
      const categoryName = jsonData[i].Category;
      // Find or create the category for the current row
      let category = await Category.findOne({
        user_id: userId,
        category_name: categoryName,
      }).session(session);

      if (!category) {
        category = new Category({
          user_id: userId,
          category_name: categoryName,
          category_type: "income", // Adjust as needed
          description: null,
        });

        // Save the new category
        await category.save({ session });
      }

      // Prepare data for bulk insertion
      const newIncomeDetails = {
        user_id: userId,
        date: date,
        description: description,
        category_id: category._id,
        amount: amount,
      };

      // Add data to the bulk insert array
      bulkInsertData.push(newIncomeDetails);
    }

    // Insert all data in bulk
    await IncomeDetails.insertMany(bulkInsertData, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // Log the error and abort the transaction
    await session.abortTransaction();
    session.endSession();

    // Re-throw the error to handle it in the calling function
    throw error;
  }
}

module.exports = {
  importExcelData,
};
