const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Two-Factor Authentication
router.post('/2fa/setup', authMiddleware, securityController.setup2FA);
router.post('/2fa/verify', authMiddleware, securityController.verify2FA);
router.post('/2fa/disable', authMiddleware, securityController.disable2FA);

// API Keys
router.post('/api-keys', authMiddleware, securityController.createApiKey);
router.get('/api-keys', authMiddleware, securityController.listApiKeys);
router.delete('/api-keys/:keyId', authMiddleware, securityController.deleteApiKey);
router.post('/api-keys/:keyId/rotate', authMiddleware, securityController.rotateApiKey);

module.exports = router;
