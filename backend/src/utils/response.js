 export const successResponse=(res,message,data=null,statusCode=200)=>{
    return res.status(statusCode).json({
        success:true,
        message,
        data
    })
}


   export const errorResponse=(res,message,errors=null,statusCode=500)=>{
    return res.status(statusCode).json({
        success:false,
        message,
        errors
    })
  }