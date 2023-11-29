const mongoose = require('mongoose');
const castAggregation = require('mongoose-cast-aggregation');
mongoose.plugin(castAggregation); 
const categorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category_name: { type: String, maxlength: 30, required: true },
  description: { type: String, maxlength: 100 },
  category_type: {
    type: String,
    enum: ['income', 'expense', 'debit', 'credit'],
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Category', categorySchema);
