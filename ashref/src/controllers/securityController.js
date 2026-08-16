const TwoFactorAuth = require('../models/TwoFactorAuth');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Setup 2FA
exports.setup2FA = async (req, res) => {
  try {
    let twoFactor = await TwoFactorAuth.findOne({ userId: req.user.id });
    if (!twoFactor) {
      twoFactor = new TwoFactorAuth({ userId: req.user.id });
    }

    const secret = speakeasy.generateSecret({
      name: `ashref (${req.user.email})`,
      issuer: 'ashref',
    });

    // Generate backup codes
    const backupCodes = Array(10).fill(null).map(() => ({
      code: crypto.randomBytes(4).toString('hex'),
      used: false,
    }));

    twoFactor.secret = secret.base32;
    twoFactor.backupCodes = backupCodes;
    await twoFactor.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes: backupCodes.map(b => b.code),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const twoFactor = await TwoFactorAuth.findOne({ userId: req.user.id });

    if (!twoFactor) {
      return res.status(400).json({ message: '2FA not configured' });
    }

    const isValid = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    twoFactor.enabled = true;
    twoFactor.verifiedAt = new Date();
    await twoFactor.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const twoFactor = await TwoFactorAuth.findOne({ userId: req.user.id });

    if (!twoFactor) {
      return res.status(400).json({ message: '2FA not configured' });
    }

    twoFactor.enabled = false;
    twoFactor.secret = null;
    await twoFactor.save();

    res.json({ message: '2FA disabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create API Key
exports.createApiKey = async (req, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;

    const apiKey = new ApiKey({
      userId: req.user.id,
      name,
      permissions: permissions || ['read'],
      expiresAt,
    });

    await apiKey.save();

    res.status(201).json({
      message: 'API key created',
      key: apiKey.key, // Only show full key once
      maskedKey: apiKey.maskedKey,
      id: apiKey._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List API Keys
exports.listApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find(
      { userId: req.user.id },
      '-key' // Exclude full key
    ).sort({ createdAt: -1 });

    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete API Key
exports.deleteApiKey = async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.keyId);

    if (!key || key.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'API key not found' });
    }

    await ApiKey.deleteOne({ _id: req.params.keyId });

    res.json({ message: 'API key deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rotate API Key
exports.rotateApiKey = async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.keyId);

    if (!key || key.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'API key not found' });
    }

    const newKey = new ApiKey({
      userId: key.userId,
      name: key.name + ' (rotated)',
      permissions: key.permissions,
      expiresAt: key.expiresAt,
    });

    await newKey.save();
    await ApiKey.deleteOne({ _id: key._id });

    res.json({
      message: 'API key rotated',
      newKey: newKey.key,
      maskedKey: newKey.maskedKey,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
