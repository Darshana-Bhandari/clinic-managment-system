import express from "express";

import authRoutes from "../module/auth/auth.routes.js";
import adminRoutes from "../module/auth/admin.routes.js";
import patientRoutes from "../module/patient/patient.routes.js";
import doctorRoutes from "../module/docter/docter.routes.js";
import departmentRoutes from "../module/department/department.routes.js";
import medicalRecordRoutes from "../module/medicalRecord/medicalRecord.routes.js"
import billingRoutes from "../module/billing/billing.routes.js"
import paymentRoutes from "../module/payments/payment.routes.js"


const router = express.Router();

router.get("/health", (req, res) => {
  return res.json({
    message: "clinic management system",
    success: true,
  });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/patient", patientRoutes);
router.use("/doctor", doctorRoutes);
router.use("/appointment",appointmentRoutes);
router.use("/department", departmentRoutes);
router.use("/medical-record",medicalRecordRoutes)
router.use("/billing",billingRoutes)
router.use("/payments", paymentRoutes) 

export default router;