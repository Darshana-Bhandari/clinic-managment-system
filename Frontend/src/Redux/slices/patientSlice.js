import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import * as patientServices from '../../services/patientServices.js';

const initialState = {
  patients: [],
  profile: null,
  selectedPatient: null,
  statistics: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  isLoading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk(
  'patient/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await patientServices.getAllPatients(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load patients');
    }
  }
);

export const fetchPatientProfile = createAsyncThunk(
  'patient/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await patientServices.getPatientProfile();
    } catch (error) {
      if (error.response?.status === 404) {
        return rejectWithValue('PROFILE_MISSING');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to load patient profile');
    }
  }
);

export const savePatientProfile = createAsyncThunk(
  'patient/saveProfile',
  async ({ patientId, payload, files }, { rejectWithValue }) => {
    try {
      if (patientId) {
        return await patientServices.updatePatient(patientId, payload, files);
      }
      return await patientServices.createPatient(payload, files);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save patient profile');
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patient/fetchById',
  async (patientId, { rejectWithValue }) => {
    try {
      return await patientServices.getPatientById(patientId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load patient');
    }
  }
);

export const removePatient = createAsyncThunk(
  'patient/delete',
  async (patientId, { rejectWithValue }) => {
    try {
      await patientServices.deletePatient(patientId);
      return patientId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete patient');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearPatientError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload?.patients || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to load patients');
      })
      .addCase(fetchPatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload !== 'PROFILE_MISSING') {
          state.error = action.payload;
        }
      })
      .addCase(savePatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(savePatientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        toast.success('Patient profile saved');
      })
      .addCase(savePatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to save profile');
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.selectedPatient = action.payload;
      })
      .addCase(removePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter((item) => item.id !== action.payload);
        toast.success('Patient removed');
      })
      .addCase(removePatient.rejected, (state, action) => {
        toast.error(action.payload || 'Failed to delete patient');
      });
  },
});

export const { clearPatientError } = patientSlice.actions;
export default patientSlice.reducer;