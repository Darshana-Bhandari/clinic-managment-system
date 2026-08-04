export const sucessResponse = (res, data, message = null,statuscode=200) => {
  return res.status(statuscode).json({
    success: true,
    message: message,
    data: data,
  });
}

export const errorResponse=(res,message,errors=null,statuscode=500)=>{
    return res.status(statuscode).json({
        success: false,
        message: message,
        errors: errors  
    })
}