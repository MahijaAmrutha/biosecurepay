const Transaction = require('../models/Transaction');
const User = require('../models/User');
const matchBiometrics = require('../ml/biometricMatcher');
const PinFailureLog = require('../models/PinFailureLog');
const transporter = require('../config/email');
const OTPVerification = require('../models/OTPVerification');
const crypto = require('crypto');

exports.processTransaction = async (req, res) => {
  const { userId, recipient, amount, biometrics, pin } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bcrypt = require('bcrypt');
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      await PinFailureLog.create({ user: user._id, time: new Date(), ip: req.ip });

      // Send email alert
      await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: user.email,
        subject: 'BioSecurePay - Failed PIN Attempt Alert',
        html: '<p>There was a failed PIN attempt on your BioSecurePay account. If this was not you, please reset your PIN immediately.</p>'
      });

      // Count recent failures
      const recentFailures = await PinFailureLog.countDocuments({
        user: user._id,
        time: { $gt: new Date(Date.now() - 15 * 60 * 1000) }
      });

      if (recentFailures >= 3) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTPVerification.create({
          userId: user._id,
          otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await transporter.sendMail({
          from: 'your-email@gmail.com',
          to: user.email,
          subject: 'OTP Verification - BioSecurePay',
          html: `<p>Too many failed PIN attempts. Use the OTP below to verify your identity:</p><h3>${otp}</h3>`
        });

        return res.status(401).json({
          message: 'Multiple failed attempts. OTP sent to your email for verification.',
          requireOTP: true
        });
      }

      return res.status(401).json({ message: 'Invalid PIN ❌' });
    }

    const storedTemplate = user.biometricTemplate;
    const isMatch = matchBiometrics(storedTemplate, biometrics);
    const status = isMatch ? 'success' : 'failure';

    await Transaction.create({
      sender: user._id,
      recipient,
      amount,
      status,
      biometrics
    });

    if (isMatch) {
      res.status(200).json({ message: 'Transaction successful ✅' });
    } else {
      res.status(401).json({ message: 'Biometric mismatch ❌ Transaction rejected' });
    }

  } catch (err) {
    console.error('Transaction Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
