import jwt from "jsonwebtoken" 
import { env } from "../config/env.js"


export  const generateAccessToken=(payload)=>{
   return jwt.sign(payload,env.JWT_ACCESS_SECRET,{
         expiresIn:env.ACCESS_TOKEN_EXPIRES
    })
}


export const generateRefreshToken=(payload)=>{
    return jwt.sign(payload,env.JWT_REFRESH_SECRET,{
         expiresIn:env.REFRESH_TOKEN_EXPIRES
    })
}

export const verifyACCESSTOKEN=(payload)=>{
    return jwt.verify(token , env.JWT_ACCESS_SECRET)
}

export const verifyRefreshToken=(payload)=>{
    return jwt.verify(token , env.JWT_REFRESH_SECRET)
}