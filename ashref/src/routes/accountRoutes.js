const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Email verification
router.post('/verify-email', accountController.verifyEmail);

// User preferences
router.get('/preferences', authMiddleware, accountController.getPreferences);
router.put('/preferences', authMiddleware, accountController.updatePreferences);

// Account management
router.delete('/delete-account', authMiddleware, accountController.deleteAccount);
router.post('/recover-account', authMiddleware, accountController.recoverAccount);

module.exports = router;
