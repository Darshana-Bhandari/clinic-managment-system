import jwt from 'jsonwebtoken';
import config from '../config/env.js';

// Generate Access Token
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
        expiresIn: config.JWT_ACCESS_EXPIRE || '15m',
    });
};

// Generate Refresh Token
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: config.JWT_REFRESH_EXPIRE || '7d',
    });
};

// Verify Access Token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('ACCESS_TOKEN_EXPIRED');
        }
        throw new Error('INVALID_ACCESS_TOKEN');
    }
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('REFRESH_TOKEN_EXPIRED');
        }
        throw new Error('INVALID_REFRESH_TOKEN');
    }
};

// Decode Token
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
};