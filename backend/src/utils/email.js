import nodemailer from "nodemailer"
import {EMAIL_HOST} from "../config/env.js"



// create transporter
const transporter = nodemailer.createTransport({
    host:EMAIL_HOST,
    port:EMAIL_PORT,
    secure:EMAIL_SECURE,
    auth:{
        user:EMAIL_USER,
        pass:EMAIL_PASS

    }

})


/// send email
 export const sendEmail = async (toString,subject,html , text="")=>{
    try {
        const emailOptions ={
            from:EMAIL_USER,
            to,
            subject,
            html,
            text,
        }
        const info = await transporter.sendMail(emailOptions)
        return info;
    }
    catch(error){
        console.log('email sending error:',error)
        
    }
}


// send verification otp 
 export const vsendVerificationOtp = async (email, otp , name="USER")=>{
    const html= `<!DOCTYPE html >
    <html >
    <head>
    <style>



    </style>
    </head>
    <body>
    <div class ="container">
    <div class="header" >
    <h2 > Email verification </h2>
    </div>
    <div class ="content" >
    <p> Hello ${name} </P>
    <p> Thank you  for registration with cms. Please use the following OTP to verify you email address : </p>
    <div class="otp-box" > ${otp} </div>
    <p> this otp will expire in 10 minutes


    </body>
    </ hmtl>
    `;

     return await sendEmail(email, "verify your email -cms",html)
}



// password reset emaik  assignment     // rahultharu980893@gmail 
 export const sendPasswordOTPEmail = async (email, otp, name="User") =>{
    // const html=
}