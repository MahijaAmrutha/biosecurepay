const mongoose = require('mongoose');

// Function to assign fixed random balance between ₹1000 and ₹50000
const generateInitialBalance = () => {
  return Math.floor(Math.random() * 49001) + 1000; // 1000 to 50000
};

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  pin: String,

  // ✅ Assign fixed random balance only once at registration
  balance: {
    type: Number,
    default: generateInitialBalance
  },

  beneficiaries: { type: [String], default: [] },

  biometricTemplate: {
    keystrokes: { type: Array, default: [] },
    mouse: { type: Array, default: [] },
    touches: { type: Array, default: [] },
    navigation: { type: Array, default: [] },
    loginTime: Number
  },

  resetToken: String,
  resetTokenExpiry: Date
});

module.exports = mongoose.model('User', userSchema);
