import express from "express"
import authRoutes from "../module/auth/auth.routes.js"
import staffRoutes from "../module/staff/staff.routes.js"
import adminRoutes from "../module/admin/admin.routes.js"
import patientRoutes from "../module/patient/patient.routes.js"
import doctorRoutes from "../module/doctor/doctor.routes.js"
import appointmentRoutes from "../module/appointment/appointent.routes.js"
import departmentRoutes from "../module/department/department.routes.js"
import medicalRecordRoutes from "../module/medicalRecord/medicalRecord.routes.js"
import billingRoutes from "../module/billing/billing.routes.js"
import paymentRoutes from "../module/payments/payment.routes.js"
import khaltiRoutes from "../module/khalti/khalti.routes.js"
import esewaRoutes from "../module/esewa/esewa.routes.js"
import dashboardRoutes from "../module/dashboard/dashboard.routes.js"

const router = express.Router();

// ==================== PUBLIC HEALTH CHECK ====================
router.get("/health", (req, res) => {
    return res.json({
        message: "Clinic Management System",
        success: true,
        timestamp: new Date().toISOString(),
    });
});

// ==================== AUTH ROUTES (PUBLIC — login / register / reset) ====================
// Self-registration endpoint at /api/auth/register is restricted to PATIENT only.
// Admin / Doctor / Receptionist accounts MUST be provisioned by an existing Admin
// using the /api/admin or /api/staff endpoints below.
router.use("/auth", authRoutes);

// ==================== ADMIN ONLY ROUTES ====================
// /api/admin  — admin user management + audit logs + create additional admins
// /api/staff  — create / list / update / deactivate / delete DOCTOR & RECEPTIONIST accounts
router.use("/admin", adminRoutes);
router.use("/staff", staffRoutes);

// ==================== BUSINESS MODULES ====================
router.use("/patient", patientRoutes);
router.use("/doctor", doctorRoutes);
router.use("/appointment", appointmentRoutes);
router.use("/department", departmentRoutes);
router.use("/medical-record", medicalRecordRoutes);
router.use("/billing", billingRoutes);
router.use("/payments", paymentRoutes);
router.use("/khalti", khaltiRoutes);
router.use("/esewa", esewaRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;