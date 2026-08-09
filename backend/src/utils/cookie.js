import { ENV } from '../config/env.js';

export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    domain: ENV.COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    domain: ENV.COOKIE_DOMAIN,
  });
};