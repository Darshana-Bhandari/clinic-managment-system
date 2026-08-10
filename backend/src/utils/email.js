import nodemailer from 'nodemailer';
import { ENV } from './env.js';

// Create email transporter
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    secure: ENV.EMAIL_PORT === 465,
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASSWORD,
    },
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: ENV.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

// Email Templates
export const getVerificationEmailTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Verification</h1>
        </div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
        <div class="otp-code">${otp}</div>
        <div class="details">
          <p><strong>⏰ Expires in:</strong> ${ENV.OTP_EXPIRY_MINUTES} minutes</p>
          <p><strong>📧 Email:</strong> ${ENV.EMAIL_FROM}</p>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getPasswordResetEmailTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 20px; text-align: center; }
        .otp-code { font-size: 32px; font-weight: bold; color: #f44336; text-align: center; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Reset Your Password</h1>
        </div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Use the following OTP:</p>
        <div class="otp-code">${otp}</div>
        <div class="details">
          <p><strong>⏰ Expires in:</strong> ${ENV.OTP_EXPIRY_MINUTES} minutes</p>
          <p><strong>🔒 Security Tip:</strong> Never share this OTP with anyone</p>
        </div>
        <p>If you didn't request this, please ignore this email and secure your account.</p>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};