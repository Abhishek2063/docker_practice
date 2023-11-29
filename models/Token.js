const mongoose = require('mongoose');
const castAggregation = require('mongoose-cast-aggregation');
mongoose.plugin(castAggregation); 
const tokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, maxlength: 1000 },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Token', tokenSchema);
