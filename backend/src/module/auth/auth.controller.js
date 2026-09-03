import * as authService from './auth.service.js';
import {
    successResponse,
    createdResponse,
    errorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse,
    serverErrorResponse,
    handleZodError
} from '../../utils/response.js';
import { uploadToCloudinarySingle, deleteFromCloudinaryFn } from '../../config/multer.js';
import { setAccessTokenCookie, setRefreshTokenCookie, clearTokens } from '../../utils/cookie.js';
import { 
    registerSchema, 
    loginSchema, 
    verifyEmailSchema,
    resendVerificationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updateProfileSchema,
    updateRoleSchema
} from './auth.schema.js';
import { MESSAGES } from '../../constans/messages.js';

// ==================== AUTHENTICATION CONTROLLERS ====================

// Register User
export const register = async (req, res) => {
    try {
        const validatedData = await registerSchema.parseAsync(req.body);
        const userData = {
            fullName: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            password: validatedData.password,
            role: validatedData.role
        };

        const result = await authService.registerUser(userData);

        // Set cookies
        setAccessTokenCookie(res, result.accessToken);
        setRefreshTokenCookie(res, result.refreshToken);

        return createdResponse(res, result, MESSAGES.USER_REGISTERED);
    } catch (error) {
        console.error('Register error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === MESSAGES.EMAIL_ALREADY_EXIST) {
            return conflictResponse(res, error.message);
        }
        if (error.message === MESSAGES.PHONE_ALREADY_EXIST) {
            return conflictResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Registration failed');
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const validatedData = await loginSchema.parseAsync(req.body);
        const { email, password } = validatedData;
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await authService.loginUser(email, password, userAgent, ipAddress);

        // Set cookies
        setAccessTokenCookie(res, result.accessToken);
        setRefreshTokenCookie(res, result.refreshToken);

        return successResponse(res, {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        }, MESSAGES.USER_LOGGED_IN);
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === MESSAGES.INVALID_CREDENTIALS) {
            return unauthorizedResponse(res, error.message);
        }
        if (error.message === MESSAGES.ACCOUNT_DISABLED) {
            return forbiddenResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Login failed');
    }
};

// Logout User
export const logout = async (req, res) => {
    try {
        const userId = req.user.id;
        const accessToken = req.cookies?.accessToken;

        await authService.logoutUser(userId, accessToken);
        clearTokens(res);

        return successResponse(res, null, MESSAGES.USER_LOGGED_OUT);
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(res, error.message || 'Logout failed');
    }
};

// Refresh Token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        const userAgent = req.get('User-Agent');
        const ipAddress = req.ip || req.connection.remoteAddress;

        const result = await authService.refreshAccessToken(refreshToken, userAgent, ipAddress);

        // Set new cookies
        setAccessTokenCookie(res, result.accessToken);
        setRefreshTokenCookie(res, result.refreshToken);

        return successResponse(res, {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        }, MESSAGES.TOKEN_REFRESHED);
    } catch (error) {
        console.error('Refresh token error:', error);
        
        if (error.message === 'Refresh token expired' || error.message === MESSAGES.INVALID_REFRESH_TOKEN) {
            return unauthorizedResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Failed to refresh token');
    }
};

// ==================== EMAIL VERIFICATION CONTROLLERS ====================

// Verify Email
export const verifyEmail = async (req, res) => {
    try {
        const validatedData = await verifyEmailSchema.parseAsync(req.body);
        const { email, otp } = validatedData;
        const user = await authService.verifyEmail(email, otp);
        
        return successResponse(res, user, MESSAGES.EMAIL_VERIFIED);
    } catch (error) {
        console.error('Verify email error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === MESSAGES.INVALID_OTP) {
            return errorResponse(res, error.message, 400);
        }
        if (error.message === MESSAGES.OTP_EXPIRED) {
            return errorResponse(res, error.message, 400);
        }
        
        return errorResponse(res, error.message || 'Email verification failed');
    }
};

// Resend Verification OTP
export const resendVerification = async (req, res) => {
    try {
        const validatedData = await resendVerificationSchema.parseAsync(req.body);
        const { email } = validatedData;
        const result = await authService.resendVerificationOTP(email);
        
        return successResponse(res, null, result.message);
    } catch (error) {
        console.error('Resend verification error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        if (error.message === MESSAGES.EMAIL_ALREADY_VERIFIED) {
            return conflictResponse(res, error.message);
        }
        if (error.message.includes('Please wait')) {
            return errorResponse(res, error.message, 429);
        }
        
        return errorResponse(res, error.message || 'Failed to resend verification');
    }
};

// ==================== PASSWORD MANAGEMENT CONTROLLERS ====================

// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const validatedData = await forgotPasswordSchema.parseAsync(req.body);
        const { email } = validatedData;
        const result = await authService.forgotPassword(email);
        
        return successResponse(res, null, result.message);
    } catch (error) {
        console.error('Forgot password error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        if (error.message.includes('Please wait')) {
            return errorResponse(res, error.message, 429);
        }
        
        return errorResponse(res, error.message || 'Failed to send reset email');
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const validatedData = await resetPasswordSchema.parseAsync(req.body);
        const { email, otp, newPassword } = validatedData;
        const user = await authService.resetPassword(email, otp, newPassword);
        
        return successResponse(res, user, MESSAGES.PASSWORD_RESET);
    } catch (error) {
        console.error('Reset password error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === MESSAGES.INVALID_OTP) {
            return errorResponse(res, error.message, 400);
        }
        if (error.message === MESSAGES.OTP_EXPIRED) {
            return errorResponse(res, error.message, 400);
        }
        
        return errorResponse(res, error.message || 'Failed to reset password');
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const validatedData = await changePasswordSchema.parseAsync(req.body);
        const userId = req.user.id;
        const { currentPassword, newPassword } = validatedData;
        const result = await authService.changePassword(userId, currentPassword, newPassword);
        
        return successResponse(res, null, result.message);
    } catch (error) {
        console.error('Change password error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === 'Current password is incorrect') {
            return errorResponse(res, error.message, 400);
        }
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Failed to change password');
    }
};

// ==================== PROFILE CONTROLLERS ====================

// Get User Profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await authService.getUserProfile(userId);
        
        return successResponse(res, user, MESSAGES.USER_FETCHED);
    } catch (error) {
        console.error('Get profile error:', error);
        
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Failed to get profile');
    }
};

// Update User Profile
export const updateProfile = async (req, res) => {
    try {
        const validatedData = await updateProfileSchema.parseAsync(req.body);
        const userId = req.user.id;

        // Handle avatar upload if file present
        let avatarData = null;
        if (req.file) {
            avatarData = await uploadToCloudinarySingle(req.file, 'healthcare/avatars');
        }

        const updatePayload = {
            ...validatedData,
            ...(avatarData && { avatar: avatarData.url }),
        };

        const user = await authService.updateUserProfile(userId, updatePayload);

        return successResponse(res, user, MESSAGES.PROFILE_UPDATED);
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        if (error.message === 'Phone number already exists') {
            return conflictResponse(res, error.message);
        }
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }

        return errorResponse(res, error.message || 'Failed to update profile');
    }
};

// Upload / Replace Avatar
export const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return errorResponse(res, 'No avatar file provided', 400);
        }

        // Get current user to delete old avatar
        const currentUser = await authService.getUserProfile(userId);
        if (currentUser.avatar) {
            // Try to extract public_id from old avatar URL and delete it
            try {
                const urlParts = currentUser.avatar.split('/');
                const publicIdWithExt = urlParts.slice(-2).join('/');
                const publicId = publicIdWithExt.split('.')[0];
                await deleteFromCloudinaryFn(publicId);
            } catch (e) {
                console.error('Could not delete old avatar:', e.message);
            }
        }

        const avatarData = await uploadToCloudinarySingle(req.file, 'healthcare/avatars');
        const user = await authService.updateUserProfile(userId, { avatar: avatarData.url });

        return successResponse(res, { avatar: avatarData.url, user }, 'Avatar updated successfully');
    } catch (error) {
        console.error('Upload avatar error:', error);
        return errorResponse(res, error.message || 'Failed to upload avatar');
    }
};

// ==================== ADMIN CONTROLLERS ====================

// Get All Users (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const role = req.query.role;
        const search = req.query.search;

        const result = await authService.getAllUsers(page, limit, role, search);
        
        return successResponse(res, result, MESSAGES.USER_FETCHED);
    } catch (error) {
        console.error('Get all users error:', error);
        return errorResponse(res, error.message || 'Failed to get users');
    }
};

// Get User by ID (Admin)
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await authService.getUserById(userId);
        
        return successResponse(res, user, MESSAGES.USER_FETCHED);
    } catch (error) {
        console.error('Get user by ID error:', error);
        
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Failed to get user');
    }
};

// Update User Role (Admin)
export const updateUserRole = async (req, res) => {
    try {
        const validatedData = await updateRoleSchema.parseAsync(req.body);
        const userId = req.params.id;
        const { role } = validatedData;
        
        const user = await authService.updateUserRole(userId, role);
        
        return successResponse(res, user, 'User role updated successfully');
    } catch (error) {
        console.error('Update user role error:', error);
        
        if (error.name === 'ZodError') {
            return handleZodError(res, error);
        }
        
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Failed to update user role');
    }
};

// Delete User (Admin)
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await authService.deleteUser(userId);
        
        return successResponse(res, null, result.message);
    } catch (error) {
        console.error('Delete user error:', error);
        
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Failed to delete user');
    }
};

// Toggle User Status (Admin)
export const toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await authService.toggleUserStatus(userId);
        
        return successResponse(res, user, 'User status updated successfully');
    } catch (error) {
        console.error('Toggle user status error:', error);
        
        if (error.message === MESSAGES.USER_NOT_FOUND) {
            return notFoundResponse(res, error.message);
        }
        
        return errorResponse(res, error.message || 'Failed to toggle user status');
    }
};

// Get Audit Logs (Admin)
export const getAuditLogs = async (req, res) => {
    try {
        const userId = req.query.userId || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await authService.getAuditLogs(userId, page, limit);
        
        return successResponse(res, result, 'Audit logs fetched successfully');
    } catch (error) {
        console.error('Get audit logs error:', error);
        return errorResponse(res, error.message || 'Failed to get audit logs');
    }
};