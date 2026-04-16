import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '@/lib/api';

export const fetchAdminDashboard = createAsyncThunk('dashboard/fetchAdmin', async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardAPI.getAdminStats();
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchEmployeeDashboard = createAsyncThunk('dashboard/fetchEmployee', async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardAPI.getEmployeeStats();
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { adminData: null, employeeData: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => { state.loading = false; state.adminData = action.payload; })
      .addCase(fetchAdminDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchEmployeeDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployeeDashboard.fulfilled, (state, action) => { state.loading = false; state.employeeData = action.payload; })
      .addCase(fetchEmployeeDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const selectDashboard = (state) => state.dashboard;
export default dashboardSlice.reducer;
