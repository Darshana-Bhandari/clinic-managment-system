import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateTokenHash = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};