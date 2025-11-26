import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCards, createCard } from "../../redux/slices/cardsSlice";
import Card from "../Card/Card";
import AddCardModal from "../Modals/AddCardModal/AddCardModal.jsx";
import { selectCardsByColumn } from "../../redux/selectors/columnsSelectors.js";
import EditColumnModal from "../Modals/EditColumnModal/EditColumnModal.jsx";
import styles from "./Column.module.css";
import SvgIcon from "../DashboardForm/SvgIcon.jsx";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

function Column({ column, onEdit, onDelete }) {
  const dispatch = useDispatch();
  const selectCards = selectCardsByColumn();
  const cards = useSelector((state) => selectCards(state, column._id));

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCards(column._id));
  }, [column._id, dispatch]);

  const handleAddCard = (cardData) => {
    dispatch(
      createCard({
        columnId: column._id,
        cardData,
      })
    );
    setIsAddCardModalOpen(false);
  };

  const handleEditColumnTitle = (newTitle) => {
    newTitle = newTitle.trim();

    if (!newTitle || newTitle === column.title) {
      setIsEditColumnOpen(false);
      return;
    }

    onEdit(column._id, newTitle);
    setIsEditColumnOpen(false);
  };

  return (
    <div className={styles.columnContainer}>
      {/* Column Header */}
      <div className={styles.columnTitleContainer}>
        <div className={styles.columnHeader}>
          {isEditColumnOpen && (
            <EditColumnModal
              currentTitle={column.title}
              onSubmit={handleEditColumnTitle}
              onClose={() => setIsEditColumnOpen(false)}
            />
          )}
          <h3 className={styles.columnTitle}>{toTitleCase(column.title)}</h3>

          <div className={styles.columnActions}>
            <SvgIcon
              iconName="icon-pencil"
              size={24}
              onClick={() => setIsEditColumnOpen(true)}
              className={styles.editButton}
            />
            <SvgIcon
              iconName="icon-trash"
              size={24}
              onClick={() => onDelete(column._id)}
              className={styles.deleteButton}
            />
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className={styles.cardsContainer}>
        {cards.length > 0 ? (
          cards.map((card) => <Card key={card._id} card={card} columnId={column._id} />)
        ) : (
          <p className={styles.noCardsText}>No Card</p>
        )}
      </div>

      {/* Add Card Button */}
      <div className={styles.addCardButtonContainer}>
        <button onClick={() => setIsAddCardModalOpen(true)} className={styles.addCardButton}>
          <span className={styles.addCardPlusBox}>+</span>
          <span>Add another card</span>
        </button>
      </div>

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onSubmit={handleAddCard}
        />
      )}
    </div>
  );
}

export default Column;
