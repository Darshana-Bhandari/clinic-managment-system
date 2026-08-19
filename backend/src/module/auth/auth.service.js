import { prisma } from "../../config/database.js";
import {
  hashPassword,
  comparePassword,
} from "../../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { MESSAGES } from "../../constans/messages.js";
import {
  resendOtp,
  sendOtp,
  verifyOtp,
} from "../../utils/otp.js";
import { sendEmail } from "../../utils/email.js";

// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async (userData) => {
  const {
    fullName,
    email,
    phone,
    password,
    role,
  } = userData;

  // Check email
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new Error(
      MESSAGES.EMAIL_ALREADY_EXIST || "Email already exists"
    );
  }

  // Check phone
  const existingPhone = await prisma.user.findUnique({
    where: { phone },
  });

  if (existingPhone) {
    throw new Error(
      MESSAGES.PHONE_ALREADY_EXIST || "Phone number already exists"
    );
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role ? role.toUpperCase() : "PATIENT",

      profile: {
        create: {},
      },
    },

    include: {
      profile: true,
    },
  });

  // Send verification OTP
  const otp = await sendOtp(
    email,
    "EMAIL_VERIFICATION",
    newUser.id
  );

  // Send email
  await sendEmail(
    email,
    "Email Verification OTP",
    `Your verification OTP is: ${otp}`
  );

  // Generate tokens
  const payload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: newUser.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  // Remove password
  const {
    password: _,
    ...userWithoutPassword
  } = newUser;

  return {
    user: {
      id: userWithoutPassword.id,
      fullName: userWithoutPassword.fullName,
      email: userWithoutPassword.email,
      phone: userWithoutPassword.phone,
      role: userWithoutPassword.role,
      isActive: userWithoutPassword.isActive,
      isEmailVerified:
        userWithoutPassword.isEmailVerified,
    },

    accessToken,
    refreshToken,
  };
};

// ======================================================
// LOGIN USER
// ======================================================

export const loginUser = async (
  email,
  password,
  userAgent,
  ipAddress
) => {
  const user = await prisma.user.findUnique({
    where: { email },

    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new Error(
      MESSAGES.INVALID_CREDENTIALS ||
        "Invalid email or password"
    );
  }

  if (!user.isActive) {
    throw new Error(
      MESSAGES.ACCOUNT_DISABLED ||
        "Account is disabled"
    );
  }

  // Compare password
  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error(
      MESSAGES.INVALID_CREDENTIALS ||
        "Invalid email or password"
    );
  }

  // Update login information
  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      lastLoginAt: new Date(),
      lastLoginIP: ipAddress,
    },
  });

  // Generate tokens
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(
        Date.now() + 15 * 60 * 1000
      ),
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      resource: "User",
      details: {
        email: user.email,
      },
      ipAddress,
      userAgent,
    },
  });

  // Remove password
  const {
    password: _,
    ...userWithoutPassword
  } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

// ======================================================
// VERIFY EMAIL
// ======================================================

export const verifyEmail = async (email, otp) => {
  const verificationResult = await verifyOtp(
    email,
    otp,
    "EMAIL_VERIFICATION"
  );

  if (!verificationResult.success) {
    throw new Error(
      MESSAGES.INVALID_OTP || "Invalid OTP"
    );
  }

  const user = await prisma.user.update({
    where: {
      email,
    },

    data: {
      isEmailVerified: true,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "EMAIL_VERIFIED",
      resource: "User",

      details: {
        email: user.email,
      },
    },
  });

  return user;
};

// ======================================================
// RESEND VERIFICATION OTP
// ======================================================

export const resendVerificationOTP = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error(
      MESSAGES.USER_NOT_FOUND
    );
  }

  if (user.isEmailVerified) {
    throw new Error(
      MESSAGES.EMAIL_ALREADY_VERIFIED
    );
  }

  const otp = await resendOtp(
    email,
    "EMAIL_VERIFICATION",
    user.id
  );

  await sendEmail(
    email,
    "Email Verification OTP",
    `Your new verification OTP is: ${otp}`
  );

  return {
    message: "Verification OTP resent successfully",
  };
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error(
      MESSAGES.USER_NOT_FOUND
    );
  }

  const otp = await sendOtp(
    email,
    "PASSWORD_RESET",
    user.id
  );

  await sendEmail(
    email,
    "Password Reset OTP",
    `Your password reset OTP is: ${otp}`
  );

  return {
    message: "Password reset OTP sent successfully",
  };
};

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = async (
  email,
  otp,
  newPassword
) => {
  const verificationResult = await verifyOtp(
    email,
    otp,
    "PASSWORD_RESET"
  );

  if (!verificationResult.success) {
    throw new Error(
      MESSAGES.INVALID_OTP || "Invalid OTP"
    );
  }

  // IMPORTANT:
  // Don't name this variable hashPassword
  // because hashPassword is already imported.
  const hashedPassword = await hashPassword(
    newPassword
  );

  const user = await prisma.user.update({
    where: {
      email,
    },

    data: {
      password: hashedPassword,
    },
  });

  // Revoke all refresh tokens
  await prisma.refreshToken.updateMany({
    where: {
      userId: user.id,
    },

    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  });

  // Deactivate all active sessions
  await prisma.session.updateMany({
    where: {
      userId: user.id,
      isActive: true,
    },

    data: {
      isActive: false,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PASSWORD_RESET",
      resource: "User",

      details: {
        email: user.email,
      },
    },
  });

  return user;
};

// ======================================================
// GET USER PROFILE
// ======================================================

export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      profile: true,

      sessions: {
        where: {
          isActive: true,
        },

        select: {
          id: true,
          userAgent: true,
          ipAddress: true,
          lastActivity: true,
          createdAt: true,
        },
      },

      _count: {
        select: {
          sessions: true,
          refreshTokens: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error(
      MESSAGES.USER_NOT_FOUND
    );
  }

  const {
    password: _,
    ...userWithoutPassword
  } = user;

  return userWithoutPassword;
};

// ======================================================
// UPDATE USER PROFILE
// ======================================================

export const updateUserProfile = async (
  userId,
  updateData
) => {
  const {
    fullName,
    phone,
    ...otherData
  } = updateData;

  // Check phone
  if (phone) {
    const existingPhone =
      await prisma.user.findFirst({
        where: {
          phone,

          NOT: {
            id: userId,
          },
        },
      });

    if (existingPhone) {
      throw new Error(
        MESSAGES.PHONE_ALREADY_EXIST ||
          "Phone number already exists"
      );
    }
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      ...(fullName !== undefined && {
        fullName,
      }),

      ...(phone !== undefined && {
        phone,
      }),

      ...otherData,
    },

    include: {
      profile: true,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "PROFILE_UPDATED",
      resource: "User",

      details: {
        email: user.email,
      },
    },
  });

  const {
    password: _,
    ...userWithoutPassword
  } = user;

  return userWithoutPassword;
};

// ======================================================
// ADMIN - GET USER BY ID
// ======================================================

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      profile: true,

      sessions: {
        where: {
          isActive: true,
        },
      },

      refreshTokens: {
        where: {
          revoked: false,
        },
      },
    },
  });

  if (!user) {
    throw new Error(
      MESSAGES.USER_NOT_FOUND
    );
  }

  const {
    password: _,
    ...userWithoutPassword
  } = user;

  return userWithoutPassword;
};

// ======================================================
// REFRESH ACCESS TOKEN
// ======================================================

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  // Verify refresh token JWT
  const payload = verifyRefreshToken(refreshToken);

  // Check refresh token in database
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      revoked: false,
    },
  });

  if (!storedToken) {
    throw new Error("Invalid or revoked refresh token");
  }

  // Check database expiration
  if (storedToken.expiresAt < new Date()) {
    throw new Error("Refresh token expired");
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    id: payload.id,
    email: payload.email,
    role: payload.role,
  });

  // Update active session activity
  await prisma.session.updateMany({
    where: {
      userId: payload.id,
      isActive: true,
    },
    data: {
      lastActivity: new Date(),
    },
  });

  return {
    accessToken,
  };
};

// ======================================================
// LOGOUT USER
// ======================================================

export const logoutUser = async (userId, refreshToken) => {
  // Revoke refresh token
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        userId,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  // Deactivate current sessions
  await prisma.session.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: "LOGOUT",
      resource: "User",
      details: {
        message: "User logged out",
      },
    },
  });

  return {
    message: "Logged out successfully",
  };
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  if (!currentPassword || !newPassword) {
    throw new Error(
      "Current password and new password are required"
    );
  }

  if (currentPassword === newPassword) {
    throw new Error(
      "New password must be different from current password"
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error(
      MESSAGES.USER_NOT_FOUND
    );
  }

  // Check current password
  const isPasswordValid = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await hashPassword(
    newPassword
  );

  // Update password
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  // Revoke all refresh tokens
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revoked: false,
    },
    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  });

  // Deactivate all sessions
  await prisma.session.updateMany({
    where: {
      userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: "PASSWORD_CHANGED",
      resource: "User",
      details: {
        email: user.email,
      },
    },
  });

  return {
    message: "Password changed successfully",
  };
};