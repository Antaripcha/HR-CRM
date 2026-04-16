import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await employeeAPI.getAll(params);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyProfile = createAsyncThunk('employees/fetchMyProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await employeeAPI.getMyProfile();
    return res.data.data.employee;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createEmployee = createAsyncThunk('employees/create', async (data, { rejectWithValue }) => {
  try {
    const res = await employeeAPI.create(data);
    return res.data.data.employee;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await employeeAPI.update(id, data);
    return res.data.data.employee;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteEmployee = createAsyncThunk('employees/delete', async (id, { rejectWithValue }) => {
  try {
    await employeeAPI.delete(id);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    myProfile: null,
    pagination: { total: 0, page: 1, pages: 1 },
    loading: false,
    error: null,
    selectedEmployee: null,
  },
  reducers: {
    setSelectedEmployee: (state, action) => { state.selectedEmployee = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.employees;
        state.pagination = { total: action.payload.total, page: action.payload.page, pages: action.payload.pages };
      })
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => { state.myProfile = action.payload; })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        toast.success('Employee created successfully');
      })
      .addCase(createEmployee.rejected, (_, action) => { toast.error(action.payload || 'Failed to create employee'); })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        toast.success('Employee updated successfully');
      })
      .addCase(updateEmployee.rejected, (_, action) => { toast.error(action.payload || 'Failed to update employee'); })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e._id !== action.payload);
        toast.success('Employee deactivated');
      })
      .addCase(deleteEmployee.rejected, (_, action) => { toast.error(action.payload || 'Failed to delete employee'); });
  },
});

export const { setSelectedEmployee, clearError } = employeeSlice.actions;
export const selectEmployees = (state) => state.employees;
export default employeeSlice.reducer;
