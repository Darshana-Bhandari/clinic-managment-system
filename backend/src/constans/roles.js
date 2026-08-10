export const ROLES = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    PATIENT: 'PATIENT',
    RECEPTIONIST: 'RECEPTIONIST',
};

export const ROLE_HIERARCHY = {
    ADMIN: 4,
    DOCTOR: 3,
    RECEPTIONIST: 2,
    PATIENT: 1,
};

export const ROLE_PERMISSIONS = {
    ADMIN: ['*'],
    DOCTOR: ['view_patients', 'manage_appointments', 'view_medical_records'],
    PATIENT: ['view_profile', 'manage_appointments', 'view_medical_records'],
    RECEPTIONIST: ['manage_appointments', 'view_patients', 'manage_schedule'],
};