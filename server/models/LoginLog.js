const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  success: Boolean,
  device: String,
  biometrics: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
