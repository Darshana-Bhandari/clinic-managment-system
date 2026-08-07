import { REFRESH_TOKEN_COOKIE_NAME,COOKIE_OPTIONS } from "../config/constants.js"
import {env} from "../config/env.js"



export const setRefreshTokenCookie=(res,token)=>{
    res.cookie("refreshToken",token,{
        httpOnly:true,
        secure:env.NODE_ENV ==="production",
        sameSite:"lax",
        maxAge: 7*24*60*60*1000     
    })
}

// clear cokkie 
 export const clearRefretokenCookie =(res)=>{
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME,COOKIE_OPTIONS)
}


// get refresh token from the cookies
export  const getRefreshTokenFromCOOKIE=(req) =>{
    return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || null}