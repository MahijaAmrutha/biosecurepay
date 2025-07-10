const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success' // Defaulting to success, override on failure
  },
  biometrics: {
    keystrokes: { type: Object, required: false },
    mouse: { type: Object, required: false },
    touches: { type: Object, required: false },
    navigation: { type: Object, required: false },
    loginTime: { type: Number, required: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
