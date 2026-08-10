import { id } from "zod/v4/locales";
import { prisma } from "../../config/database.js";
import { hashPassword, hashPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { error } from "node:console";
import { MESSAGES } from "../../constans/messages.js";
import { resendOtp, sendOtp, verifyOtp } from "../../utils/otp.js";
import { getPasswordResetEmailTemplate, sendEmail } from "../../utils/email.js";

//Register User with OTP
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

    // Create user
    const newUser = await prisma.user.create({
        data: {
            fullName,
            email,
            phone,
            password: hashedPassword,
            role: role ? role.toUpperCase() : "PATIENT",
            profile: {
                create: {}
            }
        },
        include: { profile: true }
    });

    // Send OTP for email verification
    const otp = await sendOtp(email, 'EMAIL_VERIFICATION', newUser.id);
    await sendVerificationEmail(email, otp, fullName);

    // Generate tokens
    const payload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token in database
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: newUser.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });

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


// Login User
export const loginUser = async (email, password, userAgent, ipAddress) => {
    // Find user with email
    const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true }
    });

    if (!user) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');
    }

    if (!user.isActive) {
        throw new Error(MESSAGES.ACCOUNT_DISABLED || 'Account is disabled');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error(MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
        where: { id: user.id },
        data: {
            lastLoginAt: new Date(),
            lastLoginIP: ipAddress,
        },
    });

    // Generate tokens
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
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
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
    });

    // Create session
    await prisma.session.create({
        data: {
            userId: user.id,
            token: accessToken,
            userAgent,
            ipAddress,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
    });

    // Create audit log  security for monitoring 
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

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
    };

};
 // verify email with otp 
 export const verifyEmail = async (email, otp)=>{
    // verify otp
    const verificationResult = await verifyOtp(email, otp, "EMAIL_VERIFICATION");
    if(!verificationResult.success){
        throw new Error(MESSAGES.INVALID_OTP)
    }

    //update the user email verification status 
     const user = await prisma.user.update({
        where:{
            email
        },
        data:{
            isEmailVerified:true

        }
     })

     // create audit log 
     await prisma.auditLog.create({
        data:{
            userId:user.id,
            action:'EMAIL_VERIFIED',
            resource:"User",
            details:{
                email:user.email
            }
        }
     })
     return user;

}

/// resned verification otp
export const resendVerificationOTP=async(email)=>{
    const user = await prisma.user.findUnique({
        where:{email}
    })
    if(!user){
        throw new Error(MESSAGES.USER_NOT_FOUND)
    }
    if(user.isEmailVerified){
        throw new Error(MESSAGES.EMAIL_ALREADY_VERIFIED)
    }

    // update otp resend 
    const otp = await resendOtp(email,'EMAIL_VERIFICATION', user.id);
    await sendVerificationEmail(email, otp,user.fullName)
    return {message:
        "verification otp  resent successfully"
    }
}

// forgot password  wih otp
export const forgotPassword = async(email)=>{
    const user = await prisma.user.findUnique({
        where:{email}
    })
    if(!user){
        throw new Error(MESSAGES.USER_NOT_FOUND)
    }
    const otp= await sendOtp(email ,'PASSWORD_RESET', user.id)
    await getPasswordResetEmailTemplate(email,otp,user.fullName)
    return {message:'Verification OTP successfully'}
}

// reset password with otp
export const resetPasword = async (email, otp ,newPassword)=>{
    // verify otp
    const verificationResult = await verifyOtp(email, otp,"PASSWORD_RESET")
    if(!verificationResult.success){
        throw new Error(MESSAGES.INVALID_OTP || "Invlaid otp ")
    }

    // Hash new passowrd 
    const hashPassword = await hashPassword(newPassword)
    // update user password
    const user = await prisma.user.update({
        where:{email},
        data:{password:hashPassword}
    })

    // // delete all refresh tokem and session for this user
    await  prisma.refreshToken.updateMany({
        where:{
            userId:user.id
        },
        data:{revoked:true,revokedAt:new Date()}
    })
    await prisma.session.updateMany({
        where:{userId:user.id,isActive:true},
        data:{
            isActive:true
        }
    })

    // create audit log
     await prisma.auditLog.create({
        data:{
            userId:user.id,
            action:'PASSWORD_RESET',
            resource:"User",
            details:{
                email:user.email
            }
        }
     })
return user;
}

// create  acess token 


// get user
// 

export const getUserProfile= async(userId)=>{
    const user = await prisma.user.findUnique({
    where:{id:userId},
    include:{profile:true},
    session:{
        where:{isActive:true},
        select:{
            id:true,
            userAgent :true,
            ipAddress:true,
            lastActivity:true,
            createdAt:true
        }
  } ,
  _count :{
    select:{
        session:true,
        refreshToken:true
        
    }
  }

 })
 if(!user){
    throw new Error(MESSAGES.USER_NOT_FOUND)
 }
 const {password:_,...userWithoutPassword}=user
    }


    //update user profile
    export const updateUserProfile=async(userId,updateData)=>{
        const {fullName,phoneNUMBER,...otherData}= updateData
        // check if phone already exists 
        if(phoneNUMBER){
            const existingPhone = await prisma.user.findFirst({
                where:{
                    phone:phoneNUMBER,
                    NOT:{
                        id:userId
                    }
                }
            });
            if(existingPhone){
                throw new Error(MESSAGES.PHONE_ALREADY_EXIST || "phone number already exists")
            }
            const user = await prisma.user.update({
                where:{id:userId},
                data:{
                    fullName,
                    phone:phoneNUMBER,
                    ...otherData
                },
                include:{
                    profile:true
                }
            })
            // create audit log
     await prisma.auditLog.create({
        data:{
            userId:user.id,
            action:'PROFILE_UPDATED',
            resource:"User",
            details:{
                email:user.email
            }
        }
     })
     const {password:_,...userWithoutPassword}=user

     return userWithoutPassword

            
        }
    }



    //change password


    //ADMIN: get all Users


    //Admin : get user by ID

    export const getUserById =async (userId)=>{
        const user= await prisma.user.findUnique({
            where:{id:userId},
            include:{
                profile:true,
                sessions:{
                    where:{
                        isActive:true
                    }
                },
                refreshTokens:{
                    where:{revoked:false}
                }
            },
            // auditLogs:{
            //     orderBy:{
            //         createdAt:"desc"
            //     },
            //     take:10
            // }
        })
    }
    if (!user){
        throw new Error(MESSAGES.USER_NOT_FOUND)
    }



    // admin profile update 
    //Admin : delete user

    // admin :toggle user status









//   export const logoutUser=async (userId)=>{
//     await prisma.user.update({
//         where:{
//             id:userId
//         },

//         data:{
//             refreshToken:null
//         }
//     })
//     return true;
//   }

//   export const getCurrentUser = async (userId) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, lastLoginAt: true, lastLoginIP: true, createdAt: true, updatedAt: true },
//   });

//   if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
//   if (!user.isActive) throw new Error(MESSAGES.ACCOUNT_DEACTIVATED);
//   return user;
// };

// export const updateUserProfile = async (userId, updateData) => {
//   const { fullName, phoneNumber, newPassword } = updateData;
//   const data = {};
//   if (fullName) data.fullName = fullName;
//   if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
//   if (newPassword) data.password = await hashPassword(newPassword);

//   return await prisma.user.update({
//     where: { id: userId },
//     data,
//     select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, createdAt: true, updatedAt: true },
//   });
// };
// // / /Admin Functions
// export const getAllUsers = async (filters = {}) => {
//   const { role, isActive, search } = filters;
//   const where = {};
//   if (role) where.role = role;
//   if (isActive !== undefined) where.isActive = isActive;
//   if (search) where.OR = [{ email: { contains: search } }, { fullName: { contains: search } }];

//   return await prisma.user.findMany({
//     where,
//     select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
//     orderBy: { createdAt: 'desc' },
//   });
// };

// export const getUserById = async (userId) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: { id: true, email: true, fullName: true, phoneNumber: true, role: true, isActive: true, lastLoginAt: true, lastLoginIP: true, createdAt: true, updatedAt: true },
//   });
//   if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
//   return user;
// }