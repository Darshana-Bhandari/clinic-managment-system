import  {optional, z} from  "zod"

export const registerSchema=z.object({
    fullName:z.string().trim().min(3,"Fullname must be at least 3 characters"),
    email:z.string().trim().email("Invalid email address"),
    phone:z.string().trim().min(10,"phone number must be at least 10digits").max(15,"phone number cannot exceed 15 dgits ").optional(),
    password:z.string().min(8, 'password must be at least 8 characters'),
    role:z.enum(["ADMIN","STAFF","DOCTOR","PATIENT"],optional())
})