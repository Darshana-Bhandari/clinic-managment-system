import { ZodError } from "zod";

import {
  errorResponse,
  successResponse,
} from "../../utils/response.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.schema.js";

import {
  registerUser,
  loginUser,
  verifyEmail as verifyEmailService,
  resendVerificationOTP,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  getUserProfile,
  updateUserProfile,
  getUserById as getUserByIdService,
  refreshAccessToken,
  logoutUser,
  changeUserPassword,
} from "./auth.service.js";

import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../../utils/cookie.js";

import { MESSAGES } from "../../constans/messages.js";

import { STATUS_CODES } from "../../constans/statusCodes.js";

// ======================================================
// REGISTER
// ======================================================

export const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await registerUser(data);

    setRefreshTokenCookie(res, result.refreshToken);

    return successResponse(
      res,
      result,
      MESSAGES.USER_REGISTERED,
      STATUS_CODES.CREATED
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        "Validation failed",
        STATUS_CODES.BAD_REQUEST,
        error.flatten()
      );
    }

    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// LOGIN
// ======================================================

export const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(
      data.email,
      data.password,
      req.get("User-Agent"),
      req.ip
    );

    setRefreshTokenCookie(res, result.refreshToken);

    return successResponse(
      res,
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      MESSAGES.USER_LOGGED_IN,
      STATUS_CODES.OK
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        "Validation failed",
        STATUS_CODES.BAD_REQUEST,
        error.flatten()
      );
    }

    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// VERIFY EMAIL
// ======================================================

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(
        res,
        "Email and OTP are required",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const result = await verifyEmailService(
      email,
      otp
    );

    return successResponse(
      res,
      result,
      "Email verified successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// RESEND VERIFICATION OTP
// ======================================================

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(
        res,
        "Email is required",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const result = await resendVerificationOTP(
      email
    );

    return successResponse(
      res,
      result,
      result.message,
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(
        res,
        "Email is required",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const result = await forgotPasswordService(
      email
    );

    return successResponse(
      res,
      result,
      result.message,
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(
        res,
        "Email, OTP and new password are required",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const result = await resetPasswordService(
      email,
      otp,
      newPassword
    );

    return successResponse(
      res,
      result,
      "Password reset successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// REFRESH TOKEN
// ======================================================

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return errorResponse(
        res,
        "Refresh token is required",
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const result = await refreshAccessToken(token);

    return successResponse(
      res,
      result,
      "Access token refreshed successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    clearRefreshTokenCookie(res);

    return errorResponse(
      res,
      error.message,
      STATUS_CODES.UNAUTHORIZED
    );
  }
};

// ======================================================
// GET PROFILE
// ======================================================

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await getUserProfile(userId);

    return successResponse(
      res,
      result,
      "Profile fetched successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// UPDATE PROFILE
// ======================================================

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await updateUserProfile(
      userId,
      req.body
    );

    return successResponse(
      res,
      result,
      "Profile updated successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// LOGOUT
// ======================================================

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    const token = req.cookies?.refreshToken;

    const result = await logoutUser(
      userId,
      token
    );

    clearRefreshTokenCookie(res);

    return successResponse(
      res,
      null,
      result.message,
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(
        res,
        "Current password and new password are required",
        STATUS_CODES.BAD_REQUEST
      );
    }

    const userId = req.user.id;

    const result = await changeUserPassword(
      userId,
      currentPassword,
      newPassword
    );

    clearRefreshTokenCookie(res);

    return successResponse(
      res,
      null,
      result.message,
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};
// ======================================================
// ADMIN - GET USER BY ID
// ======================================================

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await getUserByIdService(userId);

    return successResponse(
      res,
      result,
      "User fetched successfully",
      STATUS_CODES.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      error.message,
      STATUS_CODES.BAD_REQUEST
    );
  }
};