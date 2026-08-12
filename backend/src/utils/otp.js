import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { ENV } from '../config/env.js';

const DEFAULT_OTP_EXPIRY_MINUTES = 10;
const OTP_EXPIRY_MINUTES = Number(ENV.OTP_EXPIRY_MINUTES) || DEFAULT_OTP_EXPIRY_MINUTES;
const OTP_RESEND_COOLDOWN_MINUTES = 2;

const generateOtp = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max + 1).toString();
};

const generateOtpExpiry = (minutes = OTP_EXPIRY_MINUTES) => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + Number(minutes));
    return expiry;
};

const isOtpExpired = (expiryDate) => {
    const expiry = new Date(expiryDate);
    return Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now();
};

const getExistingOtp = async (email, type) => {
    return prisma.oTP.findFirst({
        where: {
            email,
            type,
            isUsed: false,
            expiresAt: {
                gt: new Date()
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const invalidateOtp = async (otpId) => {
    return prisma.oTP.update({
        where: { id: otpId },
        data: { isUsed: true }
    });
};

const createOtpRecord = async (email, otp, expiresAt, type, userId) => {
    return prisma.oTP.create({
        data: {
            email,
            otp,
            expiresAt,
            type,
            userId: userId || undefined,
            isUsed: false
        }
    });
};

const requestOtp = async (email, type = 'EMAIL_VERIFICATION', userId = null) => {
    if (!email) {
        throw new Error('Email is required to request an OTP');
    }

    const existingOTP = await getExistingOtp(email, type);

    if (existingOTP) {
        const cooldownMs = OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000;
        const timeSinceLastOTP = Date.now() - new Date(existingOTP.createdAt).getTime();

        if (timeSinceLastOTP < cooldownMs) {
            const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
            throw new Error(`Please wait ${remainingSeconds} seconds before requesting another OTP`);
        }

        await invalidateOtp(existingOTP.id);
    }

    const otp = generateOtp();
    const expiresAt = generateOtpExpiry();

    await createOtpRecord(email, otp, expiresAt, type, userId);

    return otp;
};

export const sendOtp = async (email, type = 'EMAIL_VERIFICATION', userId = null) => {
    try {
        return await requestOtp(email, type, userId);
    } catch (error) {
        console.error('Send OTP Error:', error);
        throw error;
    }
};

export const verifyOtp = async (email, otp, type = 'EMAIL_VERIFICATION') => {
    try {
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }

        const otpRecord = await prisma.oTP.findFirst({
            where: {
                email,
                otp,
                type,
                isUsed: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!otpRecord) {
            throw new Error('Invalid OTP');
        }

        if (isOtpExpired(otpRecord.expiresAt)) {
            await invalidateOtp(otpRecord.id);
            throw new Error('OTP has expired');
        }

        await invalidateOtp(otpRecord.id);

        return {
            success: true,
            message: 'OTP verified successfully',
            userId: otpRecord.userId,
            email: otpRecord.email
        };
    } catch (error) {
        console.error('Verify OTP Error:', error);
        throw error;
    }
};

export const resendOtp = async (email, type = 'EMAIL_VERIFICATION', userId = null) => {
    try {
        return await requestOtp(email, type, userId);
    } catch (error) {
        console.error('Resend OTP Error:', error);
        throw error;
    }
};