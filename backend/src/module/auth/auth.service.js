import { prisma } from "../../config/database";
import { hashPassword } from "../../utils/hash";

export const regiserUser= async ()=>{
    const {fullname, email,password, role,phone}=req.body()

    //email nad phone exitisting
    const existingUser = await prisma.user.findFirst({
        where:{
            OR:[
                {email},
                ...email(phone?[{phone}]:[])
            ]
        }

    })
    if (existingUser){
        throw new Error(" email and phone already exist ")
    }
    const hashPassowrd = await hashPassword(password)
    const newUser = await  prisma.user.create(
        {
            data:{
                fullname,
                email,
                phone,
                password:hashPassowrd,
                role
            },
            select:{
                id:true,
                fullname:true,
                email:true,
                phone:true,
                password:true,
                role:true,
                createdAt:true,
                updatedAt:true

            }
        }
    )
    return newUser
}