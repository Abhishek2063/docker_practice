const mongoose = require('mongoose');
const castAggregation = require('mongoose-cast-aggregation');
mongoose.plugin(castAggregation); 
const otpSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: String, maxlength: 10 },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('OTP', otpSchema);
