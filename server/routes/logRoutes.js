const express = require('express');
const router = express.Router();
const LoginLog = require('../models/LoginLog');

// GET /api/logs/:userId
router.get('/:userId', async (req, res) => {
  try {
    const logs = await LoginLog.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
});

module.exports = router;
