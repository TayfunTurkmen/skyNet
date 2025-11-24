import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteCard, moveCard, updateCard } from "../../redux/slices/cardsSlice";
import { LABELS } from "../../config";
import MoveCardTool from "./MoveCardTool";
import EditCardModal from "../Modals/EditCardModal/EditCardModal";
import styles from "./Card.module.css";
import SvgIcon from "../DashboardForm/SvgIcon";

const getPriorityColor = (priorityName) => {
  const label = LABELS.find((label) => label.name === priorityName);
  return label ? label.color : LABELS.find((l) => l.name === "Without").color;
};

const getPriorityText = (priorityName) => {
  return priorityName || "Without";
};

function Card({ card, columnId }) {
  const dispatch = useDispatch();
  const [showMoveTooltip, setShowMoveTooltip] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isDeadlineToday = () => {
    if (!card.deadline) return false;
    const today = new Date();
    const deadline = new Date(card.deadline);
    return deadline.toDateString() === today.toDateString();
  };

  const handleEditCard = (updatedCardData) => {
    dispatch(
      updateCard({
        cardId: card._id,
        cardData: {
          title: updatedCardData.title,
          description: updatedCardData.description,
          priority: updatedCardData.priority,
          deadline: updatedCardData.deadline,
        },
      })
    );
  };

  const handleDelete = () => {
    dispatch(deleteCard(card._id));
  };

  const handleMoveCard = (newColumnId) => {
    dispatch(
      moveCard({
        cardId: card._id,
        newColumnId,
      })
    );
    // Modal kapama işlemi artık MoveCardTool içinde handleMove fonksiyonunda yapılıyor.
    // Ancak modalın kapanması için alttaki setShowMoveTooltip(false) da gereklidir.
    setShowMoveTooltip(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR");
  };

  return (
    <>
      <div className={styles.cardContainer}>
        {/* Sol İnce Renk Çubuğu */}
        <div className={styles.priorityBar} style={{ backgroundColor: getPriorityColor(card.priority) }}></div>

        {/* Title */}
        <h4 className={styles.cardTitle}>{card.title}</h4>
        {/* Description */}
        <p className={styles.cardDescription}>{card.description}</p>

        {/* Yatay Çizgi */}
        <div className={styles.separator}></div>

        {/* Priority & Deadline & Actions */}
        <div className={styles.cardMeta}>
          {/* Öncelik ve Son Tarih Kapsayıcısı */}
          <div className={styles.metaLeft}>
            {/* Öncelik Alanı */}
            <div className={styles.metaItem}>
              <span className={styles.metaHeader}>Priority</span>
              <div className={styles.priorityContainer}>
                {/* Öncelik Noktası */}
                <div
                  className={styles.priorityDot}
                  style={{
                    backgroundColor: getPriorityColor(card.priority),
                  }}
                />
                {/* Öncelik Yazısı */}
                <span className={styles.priorityText}>{getPriorityText(card.priority)}</span>
              </div>
            </div>

            {/* Son Tarih Alanı */}
            {card.deadline && (
              <div className={styles.metaItem}>
                <span className={styles.metaHeader}>Deadline</span>
                <span className={styles.deadlineText}>{formatDate(card.deadline)}</span>
              </div>
            )}
          </div>
          {/* Aksiyon Butonları (Absolute Konumlandırma) */}
          <div className={styles.actionButtons}>
            {isDeadlineToday() && (
              <SvgIcon iconName="icon-bell" size={16} className={`${styles.bellButton}`} title="Bugün son tarih" />
            )}

            {/* Taşıma İkonuna Tıklama */}
            <SvgIcon
              size={16}
              iconName={"icon-arrow-circle-broken"}
              onClick={() => setShowMoveTooltip(true)} // Modal Açık Durumuna Ayarla
              className={`${styles.actionButton} ${styles.moveButton}`}
              title="Move"
            />

            {/* 💡 KRİTİK DEĞİŞİKLİK: MoveCardTool Modal'ı */}
            {showMoveTooltip && (
              <MoveCardTool // 💡 Bileşen adınız MoveCardTooltip ise bu adı kullanın
                isOpen={showMoveTooltip} // 💡 isOpen prop'u eklendi
                cardId={card._id}
                currentColumnId={columnId}
                onMove={handleMoveCard}
                onClose={() => setShowMoveTooltip(false)} // Kapatma işlevi
              />
            )}

            <SvgIcon
              iconName="icon-pencil"
              size={16}
              onClick={() => setIsEditModalOpen(true)}
              className={`${styles.actionButton} ${styles.editButton}`}
              title="Edit"
            />
            <SvgIcon
              iconName="icon-trash"
              size={16}
              onClick={handleDelete}
              className={`${styles.actionButton} ${styles.deleteButton}`}
              title="Delete"
            />
          </div>
        </div>
      </div>
      {/* Edit Card Modal */}
      {isEditModalOpen && (
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          card={card}
          onSubmit={handleEditCard}
        />
      )}
    </>
  );
}
export default Card;
