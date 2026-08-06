import { id } from "zod/v4/locales";
import { prisma } from "../../config/database.js";
import { hashPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { error } from "node:console";
import { MESSAGES } from "../../constans/messages.js";

export const regiserUser= async (userData)=>{
    const {fullName, email,phone,password, role}=userData
    

    //email nad phone exitisting
//     const existingUser = await prisma.user.findFirst({
//         where:{
//             OR: [
//   { email },
//   ...(phone ? [{ phone }] : [])
// ]
//         }

//     })

// check email
const existingEmail=await prisma.user.findUnique({
    where:{
        email,
    }

})
if (existingEmail){
    throw  new Error (MESSAGES.EMAILALREADY_EXIST);
}

// check phone
const estingPhone=await prisma.user.findUnique({
    where:{
        phone,
    }
})

if(estingPhone){
    throw new Error(MESSAGES.PHONE_ALREADY_EXIST)
}


    // if (existingUser){
    //     throw new Error(" email and phone already exist ")
    // }
    const hashpassword = await hashPassword(password)
    const newUser = await  prisma.user.create(
        {
            data:{
                fullName,
                email,
                phone,
                password:hashpassword,
                role
  }  });

        const payload={
            id:newUser.id,
            email:newUser.email,
            role:newUser.role

        };
        const accessToken= generateAccessToken(payload);
        const refreshToken=generateRefreshToken(payload)


    await prisma.refreshToken.create({
  data: {
    token: refreshToken,
    userId: newUser.id,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
  },
});
        
    
    return { newUser:{
        id:newUser.id,
        fullName:newUser.fullName,
        email:newUser.email,
        phone:newUser.phone,
        role:newUser.role,
        isActive:newUser.isActive
    },
    accessToken,
    refreshToken
}
}

const loginUser=async(email,password,rememberMe=False)=>{
    // const {email,password}=loginData;
// find user
const user=await prisma.user.findunique({
    where:{email}
})
if(!user){
    throw new Error(MESSAGES.INVALID_CREDENTIALS)
}
if(!user.isActive){
    throw new Error(MESSAGES.ACCOUNT_NACTIVE)

    // verify password
    const isvalidpassword = await comparepassword(password,user.password)
    if(!isvalidpassword){
        throw new Error(MESSAGES.INVALID_CREDENTIALS)
    }
const {accessToken,refreshToken}=generateTokens(user);

// last login update and refresh token
await prisma.update({
    where:{id:user.id},
    data:{
        lastLogin:new Date(),
        refreshToken:refreshToken,
    }
})
// remove sensitive data from user object
const{password:_,refreshToken:_,... userwithoutSensitive}=user;
return {user:userwithoutSensitive,accessToken,refreshToken}
accessToken
refreshToken
}

}

export const logoutUser=async(userId)=>{
    await prisma.user,update({
        where:{id:userId},
        data:{
            refreshToken:null
        }
    })
    return true;
}