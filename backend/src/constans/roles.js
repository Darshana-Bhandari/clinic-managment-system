export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.DOCTOR]: 3,
  [ROLES.RECEPTIONIST]: 2,
  [ROLES.PATIENT]: 1,
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_roles',
    'view_all_users',
    'view_audit_logs',
    'manage_all_appointments',
    'manage_all_patients',
    'manage_all_doctors',
    'revoke_all_sessions',
  ],
  [ROLES.DOCTOR]: [
    'view_own_profile',
    'update_own_profile',
    'view_own_patients',
    'manage_own_appointments',
    'view_patient_records',
    'update_patient_records',
  ],
  [ROLES.RECEPTIONIST]: [
    'view_own_profile',
    'update_own_profile',
    'manage_appointments',
    'manage_patients',
    'view_doctors_schedule',
  ],
  [ROLES.PATIENT]: [
    'view_own_profile',
    'update_own_profile',
    'view_own_appointments',
    'create_appointments',
    'cancel_own_appointments',
  ],
};

export const RESOURCES = {
  USER: 'USER',
  APPOINTMENT: 'APPOINTMENT',
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  SESSION: 'SESSION',
  ROLE: 'ROLE',
  PROFILE: 'PROFILE',
};

export const ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  REVOKE_SESSION: 'REVOKE_SESSION',
  CHANGE_ROLE: 'CHANGE_ROLE',
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  RESET_PASSWORD: 'RESET_PASSWORD',
};