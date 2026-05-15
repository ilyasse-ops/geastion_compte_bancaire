import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/';

const setConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user.token;
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const fetchAccounts = createAsyncThunk('accounts/fetchAccounts', async (_, thunkAPI) => {
  try {
    const response = await axios.get(API_URL + 'accounts', setConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const createAccount = createAsyncThunk('accounts/create', async (accountData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'accounts', accountData, setConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const fetchTransactions = createAsyncThunk('accounts/fetchTransactions', async (accountId, thunkAPI) => {
  try {
    const response = await axios.get(API_URL + `transactions/${accountId}`, setConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const performTransaction = createAsyncThunk('accounts/transaction', async (transactionData, thunkAPI) => {
  try {
    const response = await axios.post(API_URL + 'transactions', transactionData, setConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

export const deleteAccount = createAsyncThunk('accounts/delete', async (accountId, thunkAPI) => {
  try {
    const response = await axios.delete(API_URL + `accounts/${accountId}`, setConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || error.message);
  }
});

const accountSlice = createSlice({
  name: 'accounts',
  initialState: {
    accountsList: [],
    currentTransactions: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ''
  },
  reducers: {
    resetState: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.accountsList = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accountsList.push(action.payload);
        state.isSuccess = true;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accountsList = state.accountsList.filter(acc => acc.id !== parseInt(action.payload.id));
        state.isSuccess = true;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.currentTransactions = action.payload;
      })
      .addCase(performTransaction.fulfilled, (state) => {
        state.isSuccess = true;
      })
      .addCase(performTransaction.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetState } = accountSlice.actions;
export default accountSlice.reducer;
