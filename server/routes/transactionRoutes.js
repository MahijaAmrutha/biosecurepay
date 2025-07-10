const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// ✅ Corrected to use the exported function
router.post('/secure', transactionController.secureTransaction);

module.exports = router;
