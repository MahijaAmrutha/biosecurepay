const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.setPin = async (req, res) => {
  const { userId, pin } = req.body;
  if (!pin || pin.length !== 4) return res.status(400).json({ message: 'PIN must be 4 digits' });

  try {
    const hashedPin = await bcrypt.hash(pin, 10);
    const user = await User.findByIdAndUpdate(userId, { pin: hashedPin });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'PIN set successfully ✅' });
  } catch (err) {
    res.status(500).json({ message: 'Server error ❌' });
  }
};
