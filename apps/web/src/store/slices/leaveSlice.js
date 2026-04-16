import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leaveAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export const fetchLeaves = createAsyncThunk('leaves/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await leaveAPI.getAll(params);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchLeaveStats = createAsyncThunk('leaves/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await leaveAPI.getStats();
    return res.data.data.stats;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const applyLeave = createAsyncThunk('leaves/apply', async (data, { rejectWithValue }) => {
  try {
    const res = await leaveAPI.apply(data);
    return res.data.data.leave;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const reviewLeave = createAsyncThunk('leaves/review', async ({ id, action, note }, { rejectWithValue }) => {
  try {
    const res = await leaveAPI.review(id, { action, note });
    return res.data.data.leave;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelLeave = createAsyncThunk('leaves/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await leaveAPI.cancel(id);
    return res.data.data.leave;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: {
    list: [],
    stats: {},
    pagination: { total: 0, page: 1, pages: 1 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => { state.loading = true; })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.leaves;
        state.pagination = { total: action.payload.total, page: action.payload.page, pages: action.payload.pages };
      })
      .addCase(fetchLeaves.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchLeaveStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        toast.success('Leave application submitted');
      })
      .addCase(applyLeave.rejected, (_, action) => { toast.error(action.payload || 'Failed to apply leave'); })
      .addCase(reviewLeave.fulfilled, (state, action) => {
        const idx = state.list.findIndex(l => l._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        toast.success(`Leave ${action.payload.status}`);
      })
      .addCase(reviewLeave.rejected, (_, action) => { toast.error(action.payload || 'Failed to review leave'); })
      .addCase(cancelLeave.fulfilled, (state, action) => {
        const idx = state.list.findIndex(l => l._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        toast.success('Leave cancelled');
      });
  },
});

export const selectLeaves = (state) => state.leaves;
export default leaveSlice.reducer;
