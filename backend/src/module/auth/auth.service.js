import prisma from "../../config/database.js";
import { Prisma } from "@prisma/client";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { resendOtp, sendOtp, verifyOtp } from "../../utils/otp.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../utils/email.js";
import { MESSAGES } from "../../constans/messages.js";

// ==================== REGISTER USER ====================
export const registerUser = async (userData) => {
    const { fullName, email, phone, password, role } = userData;

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
        where: { email }
    });

    if (existingEmail) {
        throw new Error(MESSAGES.EMAIL_ALREADY_EXIST || 'Email already exists');
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
        where: { phone }
    });

    if (existingPhone) {
        throw new Error(MESSAGES.PHONE_ALREADY_EXIST || 'Phone number already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user - REMOVED profile creation
    const newUser = await prisma.user.create({
        data: {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: role ? role.toUpperCase() : "PATIENT",
        }
    });

    // Send OTP for email verification
    const otp = await sendOtp(email, 'EMAIL_VERIFICATION', newUser.id);
    console.log(`[DEV/DEBUG] Generated Verification OTP for ${email}: ${otp}`);
    
    try {
        await sendVerificationEmail(email, otp, fullName);
    } catch (error) {
        console.error(`⚠️ Non-fatal: Failed to send verification email to ${email}.`, error.message);
    }

    // Generate tokens
    const payload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    try {
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: newUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2000') {
            throw new Error('Refresh token storage failed due to token length. Please contact support.');
        }
        throw error;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return {
        user: {
            id: userWithoutPassword.id,
            fullName: userWithoutPassword.fullName,
            email: userWithoutPassword.email,
            phone: userWithoutPassword.phone,
            role: userWithoutPassword.role,
            isActive: userWithoutPassword.isActive,
            isEmailVerified: userWithoutPassword.isEmailVerified,
        },
        accessToken,
        refreshToken
    };
};

const createAuthSession = async (user, userAgent, ipAddress, action = 'LOGIN') => {
    await prisma.user.update({
        where: { id: user.id },
        data: {
            lastLoginAt: new Date(),
            lastLoginIP: ipAddress,
        },
    });

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    try {
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                userAgent,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2000') {
            throw new Error('Refresh token storage failed due to token length. Please contact support.');
        }
        throw error;
    }

    try {
        await prisma.session.create({
            data: {
                userId: user.id,
                token: accessToken,
                userAgent,
                ipAddress,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2000') {
            throw new Error('Session token storage failed due to token length. Please contact support.');
        }
        throw error;
    }

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action,
            resource: 'User',
            details: { email: user.email },
            ipAddress,
            userAgent,
        },
    });

    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};

// ==================== LOGIN USER ====================
export const loginUser = async (email, password, userAgent, ipAddress) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');
    }

    if (!user.isActive) {
        throw new Error(MESSAGES.ACCOUNT_DISABLED || 'Account is disabled');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');
    }

    if (user.role === 'ADMIN') {
        throw new Error('Administrators must sign in through the admin portal');
    }

    return createAuthSession(user, userAgent, ipAddress, 'LOGIN');
};

// ==================== ADMIN LOGIN (OTP) ====================
export const initiateAdminLogin = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');
    }
    if (user.role !== 'ADMIN') {
        throw new Error('This portal is for administrators only');
    }
    if (!user.isActive) {
        throw new Error(MESSAGES.ACCOUNT_DISABLED || 'Account is disabled');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');
    }

    const otp = await sendOtp(email, 'EMAIL_VERIFICATION', user.id);
    console.log(`[DEV/DEBUG] Admin login OTP for ${email}: ${otp}`);

    try {
        await sendVerificationEmail(email, otp, user.fullName);
    } catch (error) {
        console.error(`⚠️ Non-fatal: Failed to send admin login OTP to ${email}.`, error.message);
    }

    return {
        requiresOtp: true,
        email: user.email,
        message: 'A verification code has been sent to your email',
    };
};

export const completeAdminLogin = async (email, otp, userAgent, ipAddress) => {
    const verificationResult = await verifyOtp(email, otp, 'EMAIL_VERIFICATION');
    if (!verificationResult.success) {
        throw new Error(MESSAGES.INVALID_OTP);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'ADMIN') {
        throw new Error(MESSAGES.UNAUTHORIZED || 'Unauthorized access');
    }
    if (!user.isActive) {
        throw new Error(MESSAGES.ACCOUNT_DISABLED || 'Account is disabled');
    }

    if (!user.isEmailVerified) {
        await prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
        });
        user.isEmailVerified = true;
    }

    return createAuthSession(user, userAgent, ipAddress, 'ADMIN_LOGIN');
};

// ==================== VERIFY EMAIL ====================
export const verifyEmail = async (email, otp) => {
    // Verify OTP
    const verificationResult = await verifyOtp(email, otp, "EMAIL_VERIFICATION");
    if (!verificationResult.success) {
        throw new Error(MESSAGES.INVALID_OTP);
    }

    // Update the user email verification status
    const user = await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true }
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'EMAIL_VERIFIED',
            resource: "User",
            details: { email: user.email }
        }
    });

    return user;
};

// ==================== RESEND VERIFICATION OTP ====================
export const resendVerificationOTP = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    if (user.isEmailVerified) {
        throw new Error(MESSAGES.EMAIL_ALREADY_VERIFIED);
    }

    // Resend OTP
    const otp = await resendOtp(email, 'EMAIL_VERIFICATION', user.id);
    console.log(`[DEV/DEBUG] Resent Verification OTP for ${email}: ${otp}`);

    try {
        await sendVerificationEmail(email, otp, user.fullName);
    } catch (error) {
        console.error(`⚠️ Non-fatal: Failed to send verification email to ${email}.`, error.message);
        // Returning success anyway so the client can still proceed if they read the OTP from logs in dev
    }

    return { message: "Verification OTP resent successfully" };
};

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const otp = await sendOtp(email, 'PASSWORD_RESET', user.id);
    console.log(`[DEV/DEBUG] Password Reset OTP for ${email}: ${otp}`);
    
    try {
        await sendPasswordResetEmail(email, otp, user.fullName);
    } catch (error) {
        console.error(`⚠️ Non-fatal: Failed to send password reset email to ${email}.`, error.message);
    }

    return { message: 'Password reset OTP sent successfully' };
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (email, otp, newPassword) => {
    // Verify OTP
    const verificationResult = await verifyOtp(email, otp, "PASSWORD_RESET");
    if (!verificationResult.success) {
        throw new Error(MESSAGES.INVALID_OTP || "Invalid OTP");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    // Delete all refresh tokens and sessions for this user
    await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true, revokedAt: new Date() }
    });

    await prisma.session.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'PASSWORD_RESET',
            resource: "User",
            details: { email: user.email }
        }
    });

    return user;
};

// ==================== REFRESH ACCESS TOKEN ====================
export const refreshAccessToken = async (refreshToken, userAgent, ipAddress) => {
    if (!refreshToken) {
        throw new Error(MESSAGES.INVALID_REFRESH_TOKEN || 'Invalid refresh token');
    }

    // Verify refresh token
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        if (error.message === 'REFRESH_TOKEN_EXPIRED') {
            throw new Error('Refresh token expired');
        }
        throw new Error(MESSAGES.INVALID_REFRESH_TOKEN || 'Invalid refresh token');
    }

    // Check if refresh token exists in database
    const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
            token: refreshToken,
            userId: decoded.id,
            revoked: false,
        },
    });

    if (!tokenRecord) {
        throw new Error(MESSAGES.INVALID_REFRESH_TOKEN || 'Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
        await prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true, revokedAt: new Date() },
        });
        throw new Error('Refresh token expired');
    }

    // Get user - REMOVED profile include
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Save new refresh token
    try {
        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                userAgent,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2000') {
            throw new Error('Refresh token storage failed due to token length. Please contact support.');
        }
        throw error;
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true, revokedAt: new Date() },
    });

    // Invalidate old sessions and create new one
    await prisma.session.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
    });

    try {
        await prisma.session.create({
            data: {
                userId: user.id,
                token: newAccessToken,
                userAgent,
                ipAddress,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2000') {
            throw new Error('Session token storage failed due to token length. Please contact support.');
        }
        throw error;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
        user: userWithoutPassword,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

// ==================== LOGOUT USER ====================
export const logoutUser = async (userId, accessToken) => {
    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true, revokedAt: new Date() },
    });

    // Invalidate sessions
    if (accessToken) {
        await prisma.session.updateMany({
            where: { userId, token: accessToken, isActive: true },
            data: { isActive: false },
        });
    } else {
        await prisma.session.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        });
    }

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'LOGOUT',
            resource: 'User',
        },
    });

    return { message: MESSAGES.USER_LOGGED_OUT || 'User logged out successfully' };
};

// ==================== GET USER PROFILE ====================
export const getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            sessions: {
                where: { isActive: true },
                select: {
                    id: true,
                    userAgent: true,
                    ipAddress: true,
                    lastActivity: true,
                    createdAt: true
                }
            }
        }
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// ==================== UPDATE USER PROFILE ====================
export const updateUserProfile = async (userId, updateData) => {
    const { fullName, phone, ...otherData } = updateData;

    // Check if phone already exists for other user
    if (phone) {
        const existingPhone = await prisma.user.findFirst({
            where: {
                phone: phone,
                NOT: { id: userId }
            }
        });

        if (existingPhone) {
            throw new Error(MESSAGES.PHONE_ALREADY_EXIST || "Phone number already exists");
        }
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            fullName,
            phone,
            ...otherData
        }
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'PROFILE_UPDATED',
            resource: "User",
            details: { email: user.email }
        }
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true, email: true }
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    // Revoke all refresh tokens and sessions
    await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true, revokedAt: new Date() }
    });

    await prisma.session.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId,
            action: 'PASSWORD_CHANGED',
            resource: 'User',
            details: { email: user.email }
        }
    });

    return { message: 'Password changed successfully' };
};

// ==================== ADMIN: GET ALL USERS ====================
export const getAllUsers = async (page = 1, limit = 10, role = null, search = null) => {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (role) {
        where.role = role.toUpperCase();
    }
    if (search) {
        where.OR = [
            { email: { contains: search } },
            { fullName: { contains: search } },
            { phone: { contains: search } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                _count: {
                    select: { sessions: true, refreshTokens: true, auditLogs: true },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);

    const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });

    return {
        users: sanitizedUsers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// ==================== ADMIN: GET USER BY ID ====================
export const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            sessions: {
                where: { isActive: true }
            },
            refreshTokens: {
                where: { revoked: false }
            },
            auditLogs: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// ==================== ADMIN: UPDATE USER ROLE ====================
export const updateUserRole = async (userId, newRole) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole.toUpperCase() },
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: userId,
            action: 'ROLE_UPDATED',
            resource: 'User',
            details: { 
                oldRole: user.role,
                newRole: newRole.toUpperCase(),
                email: user.email,
            },
        },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
};

// ==================== ADMIN: DELETE USER ====================
export const deleteUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');
    }

    // Delete all related records
    await prisma.$transaction([
        prisma.auditLog.deleteMany({ where: { userId } }),
        prisma.session.deleteMany({ where: { userId } }),
        prisma.refreshToken.deleteMany({ where: { userId } }),
        prisma.oTP.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } }),
    ]);

    return { message: 'User deleted successfully' };
};

// ==================== ADMIN: TOGGLE USER STATUS ====================
export const toggleUserStatus = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND || 'User not found');
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: userId,
            action: 'USER_STATUS_TOGGLED',
            resource: 'User',
            details: {
                newStatus: updatedUser.isActive,
                email: user.email,
            },
        },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
};

// // ==================== ADMIN: GET AUDIT LOGS ====================
// export const getAuditLogs = async (userId = null, page = 1, limit = 20) => {
//     const skip = (page - 1) * limit;
//     const where = userId ? { userId } : {};

//     const [logs, total] = await Promise.all([
//         prisma.auditLog.findMany({
//             where,
//             include: {
//                 user: {
//                     select: {
//                         email: true,
//                         fullName: true,
//                     },
//                 },
//             },
//             skip,
//             take: limit,
//             orderBy: { createdAt: 'desc' },
//         }),
//         prisma.auditLog.count({ where }),
//     ]);

//     return {
//         logs,
//         pagination: {
//             page,
//             limit,
//             total,
//             totalPages: Math.ceil(total / limit),
//         },
//     };
// };