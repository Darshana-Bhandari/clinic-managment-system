import { id } from "zod/v4/locales";
import { prisma } from "../../config/database.js";
import { hashPassword } from "../../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

export const regiserUser= async (userData)=>{
    const {fullName, email,phone,password, role}=userData
    

    //email nad phone exitisting
    const existingUser = await prisma.user.findFirst({
        where:{
            OR: [
  { email },
  ...(phone ? [{ phone }] : [])
]
        }

    })
    if (existingUser){
        throw new Error(" email and phone already exist ")
    }
    const hashpassword = await hashPassword(password)
    const newUser = await  prisma.user.create(
        {
            data:{
                fullName,
                email,
                phone,
                password:hashpassword,
                role
   }   }),

            
            // select:{
            //     id:true,
            //     fullName:true,
            //     email:true,
            //     phone:true,
            //     password:true,
            //     role:true,
            //     creaedAt:true,
            //     updatedAt:true

            // }

           
        }
        const payload={
            id:user.id,
            email:user.email,
            role:user.role

        }
        const accesstoken= generateAccessToken(payload);
        const refreshtoken=generateRefreshToken(payload)


        await prisma.user.update({
            where:{
                id:user.id,
            },
            data:{
                refreshtoken
            }
        })
        
    
    return { newUser:{
        id:user.id,
        fullName:user.fullName,
        email:user.email,
        phone:user.phone,
        role:user.role,
        isActive:user.isActive
    },
    accesstoken,
    refreshtoken
}