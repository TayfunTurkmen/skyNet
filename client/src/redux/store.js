import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlices";
import boardsReducer from "./slices/boardsSlice";
import columnsReducer from "./slices/columnsSlice";
import cardsReducer from "./slices/cardsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    columns: columnsReducer,
    cards: cardsReducer,
  },
});

export default store;
