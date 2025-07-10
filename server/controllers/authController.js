const User = require('../models/User');
const { PythonShell } = require('python-shell');
const path = require('path');
const LoginLog = require('../models/LoginLog');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const transporter = require('../config/email');

const SALT_ROUNDS = 10;

// ✅ Register User with biometric storage
exports.registerUser = async (req, res) => {
  try {
    const { email, password, biometric, name, pin } = req.body;

    if (!name || !email || !password || !pin) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const hashedPIN = await bcrypt.hash(pin, SALT_ROUNDS);

    // ✅ Use raw behavioral biometric data
    const keystrokes = biometric?.keystrokes || [];
    const mouse = biometric?.mouse || [];
    const touches = biometric?.touches || [];
    const navigation = biometric?.navigation || [];
    const loginTime = biometric?.loginTime || 0;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      pin: hashedPIN,
      biometricTemplate: {
        keystrokes,
        mouse,
        touches,
        navigation,
        loginTime
      }
    });

    await newUser.save();

    return res.status(201).json({ message: 'Registered successfully ✅', userId: newUser._id });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found ❌' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 1000 * 60 * 15;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Reset Your Password - BioSecurePay',
      html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Reset link sent to your email ✅' });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Reset Password with Token
exports.resetPasswordWithToken = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully ✅' });
  } catch (err) {
    console.error('❌ Reset with Token Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Reset Password (after login)
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: 'Password reset successful ✅' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get User by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password -resetToken -resetTokenExpiry');
    if (!user) return res.status(404).json({ message: 'User not found ❌' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Get User Error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid password' });

    return res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Biometric feature extractor
function extractKeystrokeFeatures(rawKeystrokes) {
  if (!rawKeystrokes || rawKeystrokes.length === 0) return { dwell_mean: 0 };

  const keyDownMap = {};
  const dwellTimes = [];

  for (const event of rawKeystrokes) {
    if (event.type === 'down') {
      keyDownMap[event.key] = event.time;
    } else if (event.type === 'up' && keyDownMap[event.key]) {
      const downTime = keyDownMap[event.key];
      const upTime = event.time;
      const dwell = upTime - downTime;
      if (dwell > 0 && dwell < 1000) {
        dwellTimes.push(dwell);
      }
      delete keyDownMap[event.key];
    }
  }

  const avgDwell = dwellTimes.length
    ? dwellTimes.reduce((sum, t) => sum + t, 0) / dwellTimes.length
    : 0;

  return { dwell_mean: avgDwell };
}

function isBiometricMatch(input, stored) {
  if (!stored || !input) return false;

  const extractDwell = (events) => {
    const map = {};
    const times = [];

    for (const e of events) {
      if (e.type === 'down') {
        map[e.key] = e.time;
      } else if (e.type === 'up' && map[e.key]) {
        const dwell = e.time - map[e.key];
        if (dwell > 0 && dwell < 1000) times.push(dwell);
        delete map[e.key];
      }
    }

    return times;
  };

  const inputDwell = extractDwell(input.keystrokes);
  const storedDwell = extractDwell(stored.keystrokes);

  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const dwellDiff = Math.abs(avg(inputDwell) - avg(storedDwell));
  const dwellMatch = dwellDiff <= 100;

  const mouseMatch = Math.abs((input.mouse?.length || 0) - (stored.mouse?.length || 0)) <= 20;
  const navMatch = JSON.stringify(input.navigation) === JSON.stringify(stored.navigation);

  return dwellMatch && mouseMatch && navMatch;
}


