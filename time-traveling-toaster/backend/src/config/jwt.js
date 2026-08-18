import jwt from 'jsonwebtoken';
import config from './index.js';

const generateTokens = (userId, role = 'user') => {
  const accessToken = jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  
  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
  
  return { accessToken, refreshToken };
};

const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? config.jwt.refreshSecret : config.jwt.secret;
  return jwt.verify(token, secret);
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

export { generateTokens, verifyToken, decodeToken };