import prisma from "../config/database.js";
import jwtService from "../utils/jwt.js";
import {
    unauthorizedResponse,
    forbiddenResponse,
    serverErrorResponse,
} from "../utils/response.js";

export const verifyToken = async (req, res, next) => {
    try {
        // Get access token from cookie
        let token = req.cookies?.accessToken;

        // If cookie doesn't contain token, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;

            if (authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        // No token
        if (!token) {
            return unauthorizedResponse(
                res,
                "Authentication required"
            );
        }

        // Verify access token
        let decoded;

        try {
            decoded = jwtService.verifyAccessToken(token);
        } catch (error) {
            console.error("JWT verification error:", error);

            if (error.message === "ACCESS_TOKEN_EXPIRED") {
                return unauthorizedResponse(
                    res,
                    "Access token expired"
                );
            }

            return unauthorizedResponse(
                res,
                "Invalid access token"
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
        });

        // User doesn't exist
        if (!user) {
            return unauthorizedResponse(
                res,
                "User not found"
            );
        }

        // User account disabled
        if (!user.isActive) {
            return unauthorizedResponse(
                res,
                "Account is disabled"
            );
        }

        // Update session activity
        // Note: Commented out because `token` and `isActive` are not fields on the Session model
        // and updating session is not strictly required for auth verification.
        /*
        await prisma.session.updateMany({
            where: {
                userId: user.id,
                status: 'ACTIVE',
            },
            data: {
                lastActiveAt: new Date(),
            },
        });
        */

        // Attach user to request
        req.user = user;

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        return serverErrorResponse(
            res,
            "Internal server error"
        );
    }
};


export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            // User not authenticated
            if (!user) {
                return unauthorizedResponse(
                    res,
                    "User not authenticated"
                );
            }

            // Check role
            const hasRole = allowedRoles.some(
                (role) => role.toUpperCase() === user.role.toUpperCase()
            );

            if (!hasRole) {
                return forbiddenResponse(
                    res,
                    "Insufficient permissions"
                );
            }

            next();

        } catch (error) {
            console.error("Authorization error:", error);

            return serverErrorResponse(
                res,
                "Internal server error"
            );
        }
    };
};


export const isAdmin = authorize("ADMIN");

export const isDoctorOrAdmin = authorize(
    "DOCTOR",
    "ADMIN"
);