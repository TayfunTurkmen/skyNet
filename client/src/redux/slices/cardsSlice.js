import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { AUTH_STORAGE_KEY } from "../../config";

export const fetchCards = createAsyncThunk("cards/fetchCards", async (columnId, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    const response = await api.get(`/columns/${columnId}/cards`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const createCard = createAsyncThunk("cards/createCard", async ({ columnId, cardData }, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    const response = await api.post(`/columns/${columnId}/cards`, cardData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ...response.data, columnId };
  } catch (error) {
    console.log(error);
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateCard = createAsyncThunk("cards/updateCard", async ({ cardId, cardData }, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    const response = await api.put(`/cards/${cardId}`, cardData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteCard = createAsyncThunk("cards/deleteCard", async (cardId, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    await api.delete(`/cards/${cardId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return cardId;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const moveCard = createAsyncThunk("cards/moveCard", async ({ cardId, newColumnId }, { rejectWithValue }) => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    const token = auth?.token;
    const response = await api.patch(
      `/cards/${cardId}/move`,
      { columnId: newColumnId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { ...response.data, newColumnId };
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const cardsSlice = createSlice({
  name: "cards",
  initialState: {
    itemsByColumn: {}, // { columnId: [cards] }
    isLoading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.isLoading = false;
        const columnId = action.meta.arg;
        state.itemsByColumn[columnId] = action.payload;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.isLoading = false;
        const { columnId } = action.payload;
        if (!state.itemsByColumn[columnId]) {
          state.itemsByColumn[columnId] = [];
        }
        state.itemsByColumn[columnId].push(action.payload);
      })
      .addCase(createCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        Object.keys(state.itemsByColumn).forEach((columnId) => {
          const index = state.itemsByColumn[columnId].findIndex((card) => card._id === action.payload._id);
          if (index !== -1) {
            state.itemsByColumn[columnId][index] = action.payload;
          }
        });
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        Object.keys(state.itemsByColumn).forEach((columnId) => {
          state.itemsByColumn[columnId] = state.itemsByColumn[columnId].filter((card) => card._id !== action.payload);
        });
      })
      .addCase(moveCard.fulfilled, (state, action) => {
        const { newColumnId } = action.payload;
        // Remove from old column
        Object.keys(state.itemsByColumn).forEach((columnId) => {
          state.itemsByColumn[columnId] = state.itemsByColumn[columnId].filter(
            (card) => card._id !== action.payload._id
          );
        });
        // Add to new column
        if (!state.itemsByColumn[newColumnId]) {
          state.itemsByColumn[newColumnId] = [];
        }
        state.itemsByColumn[newColumnId].push(action.payload);
      });
  },
});

export default cardsSlice.reducer;
