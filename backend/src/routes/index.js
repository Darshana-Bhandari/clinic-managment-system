import express from "express"
import authRoutes from "../module/auth/auth.routes.js"
import adminRoutes from "../module/auth/admin.routes.js"
import patientRoutes from "../module/patient/patient.routes.js"
import doctorRoutes from "../module/doctor/doctor.routes.js"
import appointmentRoutes from "../module/appointment/appointent.routes.js"
import departmentRoutes from "../module/department/department.routes.js"

const router = express.Router();

router.get("/health",(req,res)=>{
    return res.json({
        message:"cilnic managemnet system",
        success:true
    })
})
router.use("/auth",authRoutes)
router.use("/admin",adminRoutes)
router.use("/patient",patientRoutes)
router.use("/doctor",doctorRoutes)
router.use("/appointment",appointmentRoutes)
router.use("/department",departmentRoutes)

export default router