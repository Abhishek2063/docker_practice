const mongoose = require('mongoose');
const castAggregation = require('mongoose-cast-aggregation');
require('dotenv').config(); // Load environment variables from .env
const { MONGODB_URI } = process.env; // Load the MongoDB connection URI from your .env file
mongoose.plugin(castAggregation); 
// Connect to the MongoDB database
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', async () => {
  console.log('Connected to MongoDB');

  // Once connected, trigger the table creation functions
  require('../middlewares/TableMiddleware').createTables();
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

module.exports = mongoose; // Export the mongoose object to be used in other parts of the application
