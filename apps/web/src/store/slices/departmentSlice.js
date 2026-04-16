import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export const fetchDepartments = createAsyncThunk('departments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await departmentAPI.getAll();
    return res.data.data.departments;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createDepartment = createAsyncThunk('departments/create', async (data, { rejectWithValue }) => {
  try {
    const res = await departmentAPI.create(data);
    return res.data.data.department;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateDepartment = createAsyncThunk('departments/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await departmentAPI.update(id, data);
    return res.data.data.department;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteDepartment = createAsyncThunk('departments/delete', async (id, { rejectWithValue }) => {
  try {
    await departmentAPI.delete(id);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const departmentSlice = createSlice({
  name: 'departments',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => { state.loading = true; })
      .addCase(fetchDepartments.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchDepartments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createDepartment.fulfilled, (state, action) => { state.list.push(action.payload); toast.success('Department created'); })
      .addCase(createDepartment.rejected, (_, action) => { toast.error(action.payload || 'Failed to create department'); })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.list.findIndex(d => d._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        toast.success('Department updated');
      })
      .addCase(updateDepartment.rejected, (_, action) => { toast.error(action.payload || 'Failed to update department'); })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.list = state.list.filter(d => d._id !== action.payload);
        toast.success('Department deleted');
      })
      .addCase(deleteDepartment.rejected, (_, action) => { toast.error(action.payload || 'Failed to delete department'); });
  },
});

export const selectDepartments = (state) => state.departments;
export default departmentSlice.reducer;
