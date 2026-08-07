import { ZodError } from "zod";
import { errorResponse, successResponse } from "../../utils/response.js";
import { registerSchema } from "./auth.schema.js";
import { regiserUser } from "./auth.service.js";
import { setRefreshTokenCookie } from "../../utils/cookie.js";
import { MESSAGES } from "../../constans/messages.js";
import { STATUS_CODES } from "../../constans/statusCodes.js";

export const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const result = await regiserUser(data);

    setRefreshTokenCookie(res, result.refreshToken);

    return successResponse(
      res,
      MESSAGES.REGISTER_SUCCESS,
      {
        accessToken: result.accessToken,
        user: result.newUser,
      },
      STATUS_CODES.CREATED
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        MESSAGES.VALIDATION_FAILED,
        error.flatten(),
        STATUS_CODES.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      error.message,
      null,
      STATUS_CODES.BAD_REQUEST
    );
  }
};



export const login= async (req,res)=>{
  try{
    const loginData= loginData.parse(req.body)
    const result = await loginUser(loginData)


    // set refresh token in HTTp-only
    setRefreshTokenCookie(res,result.accessToken)
    // refrsh token removed from hte response body
    delete result.refreshToken;
    return successResponse(res,result,message.LOGIN_SUCCESS);


  }
  catch (error){
    return errorResponse(res,error)
  }
}