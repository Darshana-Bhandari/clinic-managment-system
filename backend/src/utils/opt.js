import prisma from "../config/database.js"
import { MESSAGES } from "../constans/messages";



const generateOtp =()=>{
    return  crypto.randomInt(100000,999999).toString();
}


const generateAndStore= async (email , purpose="VERIFY_EMAIL", USER_ID=null)=>{
    //check rate limit 
    const recentOTP= await prisma.oTp.count({
        where:{
            email,
            purpose, 
            createdAt:{
                gte: new Date(Date.now()- 15*60*10000)  // last 15 minutes
            }
        }
    });
    if (recentOTP>=5){
        throw new Error(MESSAGES.OTP_EXPIRED)
    }
    // check resend cooldow 
    const lastOTP = await 
        prisma.oTP.findFirst({
            where:{
                email,
                purpose,
                isUSED:False

            },
            orderBy:{
                createdAt:'desc'
            }
        });
        if(lastOTP){
            const cooldownMinutes = OTP_RESEND_COOLDOWN_MINUTES;
            const cooldownMs = cooldownMinutes *60 *1000;
            const timeSinceLastOTP = Date.now() - new Date(lastOTP.createdAt).getTime();
            if(timeSinceLastOTP <cooldownMs){
                const remainingSeconds = Mail.ceil((cooldownMs - timeSinceLastOTP))/1000;

                throw new Error(` please wait ${remainingSeconds} seconds before requesting another OTP`)
            }
            //  mark previous oTP 
            await prisma.oTP.update({
                where:{
                    id :lastOTP.id},
                    data:{
                        isUsed:true
                    }

            })

        }
        // generate new otp
        const otp= generateOtp();
        const expiresAt= new Date();

        expiresAt.setMinutes(expiresAt.getMinutes()+ OTP_EXPIRY_MINUTES)


        // store otp 
        await prisma.oTP.create({
            data:{
                email,
                otp,
                expiresAt,
                purpose,
                userId:userId || undefined
            }
        })
    return otp
}