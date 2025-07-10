const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { setPin } = require('../controllers/userController'); // ✅ Correct import
// PUT /api/users/:userId/settings
router.put('/:userId/settings', async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (pin) updates.pin = pin;

    await User.findByIdAndUpdate(req.params.userId, updates);
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// 🧑 Get user by ID (excluding password)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ➕ Add Beneficiary
router.post('/:id/beneficiaries', async (req, res) => {
  const { name, accountNo } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.beneficiaries = user.beneficiaries || [];
    user.beneficiaries.push({ name, accountNo });
    await user.save();

    res.status(200).json({ message: 'Beneficiary added successfully ✅' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add beneficiary ❌' });
  }
});

// 📄 Get User's Beneficiaries
router.get('/:id/beneficiaries', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('beneficiaries');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ beneficiaries: user.beneficiaries || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching beneficiaries ❌' });
  }
});

// 📊 Get Transaction History for a User
router.get('/:id/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({ sender: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions ❌' });
  }
});

// 🔒 Set Security PIN
router.post('/set-pin', setPin); // ✅ Now it works
// 🔍 Get User by Email (for transaction recipient)
router.post('/by-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    console.error('Error in /by-email:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
