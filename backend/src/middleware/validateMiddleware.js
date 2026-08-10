import { validationResult } from 'express-validator';
import responseHandler from '../utils/response.js';

export const validate = (validations) => {
    return async (req, res, next) => {
        try {
            await Promise.all(validations.map(validation => validation.run(req)));
            const errors = validationResult(req);

            if (errors.isEmpty()) {
                return next();
            }

            const formattedErrors = errors.array().map(error => ({
                field: error.path,
                message: error.msg,
            }));

            return responseHandler.error(res, 'Validation failed', 422, formattedErrors);
        } catch (error) {
            console.error('Validation error:', error);
            return responseHandler.serverError(res);
        }
    };
};