import { createSelector } from "reselect";

const selectColumnsState = (state) => state.columns;

export const selectCardsByColumn = () =>
  createSelector(
    [(state) => state.cards.itemsByColumn, (_, columnId) => columnId],
    (itemsByColumn, columnId) => itemsByColumn[columnId] || []
  );