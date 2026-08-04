import { ZodError } from "zod"
import { errorResponse, successResponse } from "../../utils/response.js"
import { registerSchema } from "./auth.schema.js"
import { regiserUser } from "./auth.service.js"


export const register =async(req,res)=>{
    try {
         const data = registerSchema.parse(req.body)    // parse means to analyze a string of text and convert it into a data structure that the program can read and use
   const user = await regiserUser(data)


   return successResponse(
    res,"User register sucessfully",
    user,
    201
   )
        
    } catch (error) {
        if (error instanceof ZodError){
            return errorResponse(
                res,
                "validation failed",
                400,

            )
        }
         return errorResponse(res, error.message,400) }}