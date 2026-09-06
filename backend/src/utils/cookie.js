
import { ENV } from "../config/env.js";

// ==================== ACCESS TOKEN ====================

export const setAccessTokenCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    domain: ENV.COOKIE_DOMAIN,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

// ==================== REFRESH TOKEN ====================

export const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    domain: ENV.COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ==================== CLEAR ACCESS TOKEN ====================

export const clearAccessTokenCookie = (res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    domain: ENV.COOKIE_DOMAIN,
  });
};

// ==================== CLEAR REFRESH TOKEN ====================

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    domain: ENV.COOKIE_DOMAIN,
  });
};

// ==================== CLEAR BOTH TOKENS ====================

export const clearTokens = (res) => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
};

