const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');

// ✅ Inline Biometric Match Logic
// ✅ Inline Biometric Match Logic (3-factor, 2/3 match threshold)
function matchBiometrics(input, stored) {
  console.log('🧠 Starting Biometric Comparison');

  if (!input || !stored) {
    console.log('❌ Missing input or stored biometrics');
    return false;
  }

  // ⌨️ Dwell Time Comparison
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

  const inputDwell = extractDwell(input.keystrokes || []);
  const storedDwell = extractDwell(stored.keystrokes || []);
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const inputAvg = avg(inputDwell);
  const storedAvg = avg(storedDwell);
  const dwellDiff = Math.abs(inputAvg - storedAvg);
  const dwellMatch = dwellDiff <= 100;

  console.log(`⌨️ Dwell Time → Input: ${inputAvg.toFixed(2)} ms, Stored: ${storedAvg.toFixed(2)} ms, Diff: ${dwellDiff}, Match: ${dwellMatch}`);

  // 🖱 Mouse Movement Comparison
  const inputMouseLen = input.mouse?.length || 0;
  const storedMouseLen = stored.mouse?.length || 0;
  const mouseDiff = Math.abs(inputMouseLen - storedMouseLen);
  const mouseMatch = mouseDiff <= 100;

  console.log(`🖱 Mouse Events → Input: ${inputMouseLen}, Stored: ${storedMouseLen}, Diff: ${mouseDiff}, Match: ${mouseMatch}`);

  // 🧭 Navigation Comparison
  const navMatch = JSON.stringify(input.navigation || []) === JSON.stringify(stored.navigation || []);
  console.log(`🧭 Navigation → Match: ${navMatch}`);

  // Final Match Decision: Require 2 of 3 matches
  const matchCount = [dwellMatch, mouseMatch, navMatch].filter(Boolean).length;
  const result = matchCount >= 2;

  console.log(`✅ Final Decision: ${result ? 'PASS ✅' : 'FAIL ❌'} (${matchCount}/3 matched)`);
  return result;
}


exports.secureTransaction = async (req, res) => {
  try {
    const { userId, recipientEmail, amount, pin, biometric } = req.body;

    const sender = await User.findById(userId);
    const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'Sender or recipient not found' });
    }

    if (sender._id.equals(recipient._id)) {
      return res.status(400).json({ message: 'Cannot send to yourself ❌' });
    }

    const validPIN = await bcrypt.compare(pin, sender.pin);
    if (!validPIN) return res.status(401).json({ message: 'Invalid PIN' });

    const match = matchBiometrics(biometric, sender.biometricTemplate);
    if (!match) return res.status(403).json({ message: 'Biometric Mismatch ❌' });

    const amt = Number(amount);
    if (sender.balance < amt) return res.status(400).json({ message: 'Insufficient balance ❌' });

    // Update balances
    sender.balance -= amt;
    recipient.balance += amt;

    // Save transaction
    const tx = new Transaction({
      sender: sender._id,
      recipient: recipient.email,
      amount: amt
    });

    await Promise.all([sender.save(), recipient.save(), tx.save()]);

    res.status(200).json({
      message: '✅ Transaction successful',
      newBalance: sender.balance
    });
  } catch (err) {
    console.error('Transaction error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
