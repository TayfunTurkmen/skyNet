import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL, AUTH_STORAGE_KEY } from "../../config";

export const fetchBoards = createAsyncThunk("boards/fetchBoards", async (_, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;

    const response = await axios.get(`${API_BASE_URL}/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // BUNU EKLE!
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createBoard = createAsyncThunk("boards/createBoard", async (boardData, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    const response = await axios.post(`${API_BASE_URL}/boards`, boardData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateBoard = createAsyncThunk(
  "boards/updateBoard",
  async ({ boardId, boardData }, { rejectWithValue }) => {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
      const token = auth?.token;
      const response = await axios.put(`${API_BASE_URL}/boards/${boardId}`, boardData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteBoard = createAsyncThunk("boards/deleteBoard", async (boardId, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    await axios.delete(`${API_BASE_URL}/boards/${boardId}`, { headers: { Authorization: `Bearer ${token}` } });
    return boardId;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const boardsSlice = createSlice({
  name: "boards",
  initialState: {
    items: [],
    currentBoard: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    selectBoard: (state, action) => {
      const board = state.items.find((b) => b._id === action.payload);
      if (board) {
        state.currentBoard = board;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        if (action.payload.length > 0) {
          state.currentBoard = action.payload[0];
        }
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        state.currentBoard = action.payload;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.items.findIndex((board) => board._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.items = state.items.filter((board) => board._id !== action.payload);
        if (state.currentBoard?._id === action.payload) {
          state.currentBoard = state.items[0] || null;
        }
      });
  },
});

export const { selectBoard } = boardsSlice.actions;
export default boardsSlice.reducer;
