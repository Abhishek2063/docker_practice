const mongoose = require('mongoose');
const castAggregation = require('mongoose-cast-aggregation');
mongoose.plugin(castAggregation); 
const userSchema = new mongoose.Schema({
  first_name: { type: String, maxlength: 20 },
  last_name: { type: String, maxlength: 20 },
  email: { type: String, maxlength: 100, unique: true, required: true }, // Mark email as unique and required
  password: { type: String, maxlength: 100 },
  isDeleted: { type: Boolean, default: false }, // Default to false for isDeleted
});

module.exports = mongoose.model('User', userSchema);