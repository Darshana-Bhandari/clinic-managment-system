import {REFRESH_TOKEN_BYTES} from "../config/env.js"
import crypto from "crypto"


export const generateSecureToken=()=>{
    return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex')
}


 export const hashToken =(token)=>{
    return crypto.createHash('sha256').update(token).digest('hex')
}

// verify tokenhash 
export const verifyTokenHash = (token,hashToken) =>{
    const hash = crypto.createHash('sha256').update(token).digest('hex') //  get the crypto has token
    return crypto.timingSafeEqual(Buffer.from(hash),
    Buffer.from(hashToken)
)
}

// genrate cryptographically secure  random string

const generateRandomString=(length=32)=>{
    return crypto.randomBytes(length).toString('base64url')
}