import dotenv from "dotenv"
dotenv.config();


export const env ={
    PORT:process.env.PORT,
    DATABASE_URL:process.env.DATABASE_URL,
    NODE_ENV:process.env.NODE_ENV,
    JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET,
    ACCESS_TOKEN_EXPIRES:process.env.ACCESS_TOKEN_EXPIRES,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    REFRESH_TOKEN_EXPIRES:process.env.REFRESH_TOKEN_EXPIRES

}