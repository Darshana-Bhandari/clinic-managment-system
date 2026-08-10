import crypto from 'crypto';
import prisma from "../config/database.js";
import { ENV } from '../config/env.js';

// Constants
const OTP_EXPIRY_MINUTES = ENV.OTP_EXPIRY_MINUTES;
const OTP_RESEND_COOLDOWN_MINUTES =2;

// generate otp random
const generateOtp = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max + 1).toString();
};

// generate the otp expir time 
const generateOtpExpiry = (minutes = OTP_EXPIRY_MINUTES) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
};

// check otp i s expired
const isOtpExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};

// send otp 
export const sendOtp = async (email, type = "EMAIL_VERIFICATION", userId = null) => {
    try {
        // Check if there's an existing unused OTP
        const existingOTP = await prisma.oTP.findFirst({
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

        if (existingOTP) {
            // Check cooldown period
            const cooldownMs = OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000;
            const timeSinceLastOTP = Date.now() - new Date(existingOTP.createdAt).getTime();

            if (timeSinceLastOTP < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
                throw new Error(`Please wait ${remainingSeconds} seconds before requesting another OTP`);
            }

            // Mark existing OTP as used
            await prisma.oTP.update({
                where: { id: existingOTP.id },
                data: { isUsed: true }
            });
        }

        // Generate new OTP
        const otp = generateOtp();
        const expiresAt = generateOtpExpiry(OTP_EXPIRY_MINUTES);

        // Store OTP in database
        await prisma.oTP.create({
            data: {
                email,
                otp,
                expiresAt,
                type,
                userId: userId || undefined,
                isUsed: false
            }
        });

        return otp;
    } catch (error) {
        console.error('Send OTP Error:', error);
        throw error;
    }
};

// verify otp
export const verifyOtp = async (email, otp, type = "EMAIL_VERIFICATION") => {
    try {
        // Find OTP record
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

        // Check if OTP is expired
        if (isOtpExpired(otpRecord.expiresAt)) {
            // Mark as used (expired)
            await prisma.oTP.update({
                where: { id: otpRecord.id },
                data: { isUsed: true }
            });
            throw new Error('OTP has expired');
        }

        // Mark OTP as used (successful verification)
        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true }
        });

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


 //Resend OTP - Generate and send new OTP


 export const resendOtp = async (email, type = "EMAIL_VERIFICATION", userId = null) => {
    try {
        // Check if there's an existing unused OTP
        const existingOTP = await prisma.oTP.findFirst({
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

        if (existingOTP) {
            // Check cooldown period
            const cooldownMs = OTP_RESEND_COOLDOWN_MINUTES * 60 * 1000;
            const timeSinceLastOTP = Date.now() - new Date(existingOTP.createdAt).getTime();

            if (timeSinceLastOTP < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOTP) / 1000);
                throw new Error(`Please wait ${remainingSeconds} seconds before requesting another OTP`);
            }

            // Mark existing OTP as used
            await prisma.oTP.update({
                where: { id: existingOTP.id },
                data: { isUsed: true }
            });
        }

        // Generate new OTP
        const otp = generateOtp();
        const expiresAt = generateOtpExpiry(OTP_EXPIRY_MINUTES);

        // Store OTP in database
        await prisma.oTP.create({
            data: {
                email,
                otp,
                expiresAt,
                type,
                userId: userId || undefined,
                isUsed: false
            }
        });

        return otp;
    } catch (error) {
        console.error('Resend OTP Error:', error);
        throw error;
    }
};