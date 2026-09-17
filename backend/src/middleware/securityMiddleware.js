import helmet from "helmet"





// helmet configation
export const helmetMiddleware = helmet({
    // content security policy
    contentSecurityPolicy:{
        directives:{
            defaultSrc:["self"],  // 
            scriptSrc:["self", "unsafe-inline"] ,
            styleSrc:["self", "unsafe-inline", "https://googleapis.com"],
            fontSrc:['self', 'https://gstatic.com'],
            imgSrc:['src', 'data:', 'https://res.cloudinary.com'],
            connectSrc:['self', 'ENV.FRONTEND_URL', 'https://khalti.com','https://esewa.com.np'],
            objectSrc:["none"],
            upgradeInsecureRequests:[]

        }
    },
    // http strict trasport security
    hsts:{
        maxAge:31536000,  // 1 year in seconds
        includeSubDomains:true,
        preload:true
    }
})