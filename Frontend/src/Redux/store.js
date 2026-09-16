import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import patientReducer from './slices/patientSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/register/fulfilled',
          'auth/login/fulfilled',
          'auth/refreshToken/fulfilled',
          'auth/fetchProfile/fulfilled',
          'auth/updateProfile/fulfilled',
        ],
      },
    }),
  devTools: import.meta.env.VITE_NODE_ENV !== 'production',
});

export default store;