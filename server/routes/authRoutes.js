const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ Only register routes for handlers that are valid functions
if (typeof authController.registerUser === 'function') {
  router.post('/register', authController.registerUser);
}

if (typeof authController.loginUser === 'function') {
  router.post('/login', authController.loginUser);
}

if (typeof authController.forgotPassword === 'function') {
  router.post('/forgot-password', authController.forgotPassword);
}

if (typeof authController.resetPassword === 'function') {
  router.post('/reset-password', authController.resetPassword);
}

if (typeof authController.resetPasswordWithToken === 'function') {
  router.post('/reset-password/:token', authController.resetPasswordWithToken);
}

if (typeof authController.getUserById === 'function') {
  router.get('/user/:id', authController.getUserById);
}

if (typeof authController.getLoginHistory === 'function') {
  router.get('/login-history/:userId', authController.getLoginHistory);
}

module.exports = router;
