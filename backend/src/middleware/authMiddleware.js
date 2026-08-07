import { errorResponse } from "../utils/response.js";
import {UNAUTHORIZED,FORBIDDEN} from "../constans/statusCodes.js"
import { verifyACCESSTOKEN } from "../utils/jwt.js";
import { MESSAGES } from "../constans/messages.js";



export const authenticate = aysnc (req, res,next)=>{
    try{
        // get token from authrization header
        const token = req.headers.authorization?.split(" ")[1];


        if (!token){
            return errorResponse(
                res,new Error(MESSAGES.ACCESS_TOKEN_REQUIRED),
                UNAUTHORIZED
            )
        }
        const decoded = verifyACCESSTOKEN(token)
        if (!decoded){
            return errorResponse(
                res, new Error (MESSAGES.Invalid_ACCESSTOKEN_TOKEN)
            )
        }
        // get user from database 
        const user = await  prisma.user.findUnique({
            where:{
                id:decoded.id
            }
        })
         if (!user){
            return errorResponse(res,new  Error(MESSAGES.USER_NOT_FOUND),
            UNAUTHORIZED
         )
         }
         if(!user.isActive){
            return errorResponse(
                res, new Error(MESSAGES.USER_NOT_FOUND),
                FORBIDDEN
            )
         }
         req.user = user;
         next();
    }
    catch(error){
        console.log("erroro")

    }
    

}



/// auhorization middleware 

// validation Middleware