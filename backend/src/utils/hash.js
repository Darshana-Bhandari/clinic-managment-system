import bcrypt from "bcrypt"
const salt_rounds=10 // assignment 

export const hashPassword= async(password)=>{
    return await bcrypt.hash(password,salt_rounds)
}


const comparePasword=async(passowrd,hashPassword)=>{
    return await bcrypt.compare(password,hashPassword)
}