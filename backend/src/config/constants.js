export const cookiesValue={
    COOKIE_OPTIONS:{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:"lax",
        maxAge:7*24*60*60*1000  /// 7 days
    },
    REFRESH_TOKEN_COOKIE_NAME:'refreshToken',
    RATE_LIMIT:{
        windowMs:15*60*1000,
        max:100
    }
}