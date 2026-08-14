import express from "express"
import * as patientController from "./patientController.js"
import { authorize, verifyToken } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validateMiddleware.js";
import { createPatientSchema, updatePatientSchema } from "./patient.schema.js";
import { ROLES } from "../../constans/roles.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// create patient profile

router.post('/',
    authorize(ROLES.PATIENT, ROLES.RECEPTIONIST),
    validate(createPatientSchema),
    patientController.createPatient
);

// get all patients with pagination & filters
router.get('/',
    authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    patientController.getAllPatients
);

// get current user's own patient profile
router.get('/me', patientController.getPatientByUserId);

//  get patient by patient ID
router.get('/:id',
    authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    patientController.getPatientById
);

// \update patient
router.put('/:id',
    authorize(ROLES.PATIENT, ROLES.RECEPTIONIST),
    validate(updatePatientSchema),
    patientController.updatePatient
);

// delete patient (admin only)
router.delete('/:id',
    authorize(ROLES.ADMIN),
    patientController.deletePatient
);

// \get patient appointment statistics
router.get('/:id/statistics',
    authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST),
    patientController.getPatientStatistics
);

export default router;