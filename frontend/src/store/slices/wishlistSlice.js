import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = 'https://hypercart-backend-production.up.railway.app/api/wishlist';
const getConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, thunkAPI) => {
  try {
    const { data } = await axios.get(BASE, getConfig(thunkAPI));
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, thunkAPI) => {
  try {
    const { data } = await axios.post(`${BASE}/${productId}`, {}, getConfig(thunkAPI));
    return data; // { added: bool, wishlist: [...ids] }
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], ids: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.ids = action.payload.map((p) => p._id);
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.ids = action.payload.wishlist.map((id) => id.toString());
      });
  },
});

export default wishlistSlice.reducer;
