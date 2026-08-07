import { STATUS_CODES ,CREATED} from "../constans/statusCodes.js";

export const successResponse = (
  res,
  message,
  data = null,
  statusCode = STATUS_CODES.OK
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
// create response 
export const createdResponse =(res,data , message='Resource create successfully') =>{
  return successResponse(res,data,message,CREATED)
}

export const errorResponse = (
  res,
  message,
  errors = null,
  statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};