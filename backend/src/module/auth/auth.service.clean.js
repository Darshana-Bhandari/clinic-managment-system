import { prisma } from '../../config/database.js';
import { MESSAGES } from '../../constans/messages.js';
import { getPasswordResetEmailTemplate, getVerificationEmailTemplate, sendEmail } from '../../utils/email.js';
import { comparePassword, hashPassword } from '../../utils/hash.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.js';
import { resendOtp, sendOtp, verifyOtp } from '../../utils/otp.js';

export const sendVerificationEmail = async (email, otp, fullName) => {
    const html = getVerificationEmailTemplate(fullName || 'User', otp);
    return sendEmail({
        to: email,
        subject: 'Email verification',
        html,
    });
};

export const registerUser = async (userData) => {
    const { fullName, email, phone, password, role } = userData;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new Error(MESSAGES.EMAIL_ALREADY_EXIST || 'Email already exists');

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) throw new Error(MESSAGES.PHONE_ALREADY_EXIST || 'Phone number already exists');

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
        data: {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: role ? role.toUpperCase() : 'PATIENT',
        },
    });

    const otp = await sendOtp(email, 'EMAIL_VERIFICATION', newUser.id);
    await sendVerificationEmail(email, otp, fullName);

    const payload = { id: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: newUser.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

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
        refreshToken,
    };
};

export const loginUser = async (email, password, userAgent, ipAddress) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');
    if (!user.isActive) throw new Error(MESSAGES.ACCOUNT_DISABLED || 'Account is disabled');

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');

    await prisma.user.update({
        where: { id: user.id },
        data: {
            lastLoginAt: new Date(),
            lastLoginIP: ipAddress,
        },
    });

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    await prisma.session.create({
        data: {
            userId: user.id,
            token: accessToken,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'LOGIN',
            resource: 'User',
            details: { email: user.email },
            ipAddress,
            userAgent,
        },
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
};

export const verifyEmail = async (email, otp) => {
    const verificationResult = await verifyOtp(email, otp, 'EMAIL_VERIFICATION');
    if (!verificationResult.success) throw new Error(MESSAGES.INVALID_OTP);

    const user = await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
    });

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'EMAIL_VERIFIED',
            resource: 'User',
            details: { email: user.email },
        },
    });

    return user;
};

export const resendVerificationOTP = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
    if (user.isEmailVerified) throw new Error(MESSAGES.EMAIL_ALREADY_VERIFIED);

    const otp = await resendOtp(email, 'EMAIL_VERIFICATION', user.id);
    await sendVerificationEmail(email, otp, user.fullName);

    return { message: 'verification otp resent successfully' };
};

export const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);

    const otp = await sendOtp(email, 'PASSWORD_RESET', user.id);
    await sendEmail({
        to: email,
        subject: 'Password reset',
        html: getPasswordResetEmailTemplate(user.fullName, otp),
    });

    return { message: 'Verification OTP successfully' };
};

export const resetPasword = async (email, otp, newPassword) => {
    const verificationResult = await verifyOtp(email, otp, 'PASSWORD_RESET');
    if (!verificationResult.success) throw new Error(MESSAGES.INVALID_OTP || 'Invalid otp');

    const hashedPassword = await hashPassword(newPassword);
    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });

    await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true, revokedAt: new Date() },
    });

    await prisma.session.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
    });

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'PASSWORD_RESET',
            resource: 'User',
            details: { email: user.email },
        },
    });

    return user;
};

export const getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const updateUserProfile = async (userId, updateData) => {
    const { fullName, phone, ...otherData } = updateData;

    if (phone) {
        const existingPhone = await prisma.user.findFirst({
            where: {
                phone,
                NOT: { id: userId },
            },
        });

        if (existingPhone) throw new Error(MESSAGES.PHONE_ALREADY_EXIST || 'Phone number already exists');
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ...(fullName ? { fullName } : {}),
            ...(phone ? { phone } : {}),
            ...otherData,
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: user.id,
            action: 'PROFILE_UPDATED',
            resource: 'User',
            details: { email: user.email },
        },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
    return user;
};
