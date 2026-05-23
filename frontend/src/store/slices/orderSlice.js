import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://hypercart-backend-production.up.railway.app/api/orders';

const getConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createOrder = createAsyncThunk('orders/create', async (orderData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL, orderData, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/myorders`, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchVendorOrders = createAsyncThunk('orders/fetchVendor', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/vendor`, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, thunkAPI) => {
  try {
    const response = await axios.put(`${API_URL}/${id}/status`, { status }, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    vendorOrders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendorOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOrders = action.payload;
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.vendorOrders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.vendorOrders[index] = action.payload;
        }
      });
  },
});

export default orderSlice.reducer;
