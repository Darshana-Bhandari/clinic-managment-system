import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: ENV.JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId },
    ENV.JWT_REFRESH_SECRET,
    { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};