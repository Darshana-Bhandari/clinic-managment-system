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