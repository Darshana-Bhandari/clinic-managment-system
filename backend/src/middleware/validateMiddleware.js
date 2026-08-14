import { errorResponse } from "../utils/response.js";
import { STATUS_CODES } from "../constans/statusCodes.js";

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                const formattedErrors = result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));

                return errorResponse(
                    res,
                    "Validation failed",
                    STATUS_CODES.UNPROCESSABLE_ENTITY,
                    formattedErrors
                );
            }

            // Replace request body with validated data
            req.body = result.data;

            next();

        } catch (error) {
            console.error("Validation error:", error);

            next(error);
        }
    };
};