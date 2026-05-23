import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/products';

// Helper to get token
const getConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async (queryString = '', thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchVendorProducts = createAsyncThunk('products/fetchVendor', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/vendor`, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (productData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL, productData, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getConfig(thunkAPI));
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, productData }, thunkAPI) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, productData, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createProductReview = createAsyncThunk('products/createReview', async ({ productId, review }, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/${productId}/reviews`, review, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    vendorItems: [],
    loading: false,
    error: null,
    reviewLoading: false,
    reviewError: null,
    reviewSuccess: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVendorProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorItems = action.payload;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.vendorItems.push(action.payload);
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.vendorItems = state.vendorItems.filter(p => p._id !== action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.vendorItems.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.vendorItems[idx] = action.payload;
      })
      .addCase(createProductReview.pending, (state) => { 
        state.reviewLoading = true; 
        state.reviewSuccess = false;
        state.reviewError = null;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.reviewLoading = false;
        state.reviewSuccess = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.reviewError = action.payload;
      });
  },
});

export default productSlice.reducer;
