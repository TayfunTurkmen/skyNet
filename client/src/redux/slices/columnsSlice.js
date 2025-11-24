import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL, AUTH_STORAGE_KEY } from "../../config";

export const fetchColumns = createAsyncThunk("columns/fetchColumns", async (boardId, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    if (!token) {
      return rejectWithValue("Token yok, kullanıcı login olmalı");
    }

    const response = await axios.get(`${API_BASE_URL}/boards/${boardId}/columns`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const createColumn = createAsyncThunk(
  "columns/createColumn",
  async ({ boardId, columnData }, { rejectWithValue }) => {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
      const token = auth?.token;

      console.log({ boardId, columnData });

      const response = await axios.post(`${API_BASE_URL}/boards/${boardId}/columns`, columnData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateColumn = createAsyncThunk(
  "columns/updateColumn",
  async ({ columnId, columnData }, { rejectWithValue }) => {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
      const token = auth?.token;
      const response = await axios.put(`${API_BASE_URL}/columns/${columnId}`, columnData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteColumn = createAsyncThunk("columns/deleteColumn", async (columnId, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    await axios.delete(`${API_BASE_URL}/columns/${columnId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return columnId;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const columnsSlice = createSlice({
  name: "columns",
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColumns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createColumn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.items.findIndex((col) => col._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.items = state.items.filter((col) => col._id !== action.payload);
      });
  },
});

export default columnsSlice.reducer;
