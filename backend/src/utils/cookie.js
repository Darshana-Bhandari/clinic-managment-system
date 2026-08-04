import {env} from "../config/env.js"



export const setRefreshTokenCookie=(res,token)=>{
    res.cookie("refreshToken",token,{
        httpOnly:true,
        secure:env.NODE_ENV ==="production",
        sameSite:"lax",
        maxAge: 7*24*60*60*1000     
    })
}