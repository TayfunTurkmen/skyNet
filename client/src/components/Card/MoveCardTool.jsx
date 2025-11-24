import React from "react";
import { useSelector } from "react-redux";
import styles from "./MoveCardTool.module.css";
import SvgIcon from "../DashboardForm/SvgIcon";

function MoveCardTool({ isOpen, onClose, cardId, currentColumnId, onMove }) {
  const columns = useSelector((state) => state.columns.items);

  const availableColumns = columns.filter((col) => col._id !== currentColumnId);

  if (!isOpen) return null;

  const handleMove = (newColumnId) => {
    onMove(newColumnId);
    onClose();
  };

  return (
    <div className={styles.moveCardModalOverlay} onClick={onClose}>
      <div className={styles.moveCardModalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>Move Card To:</p>

          {/* 💡 YENİ: Kapatma Düğmesi */}
          <button onClick={onClose} className={styles.closeButton}>
            <SvgIcon size={16} iconName={"icon-x-close"} className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.modalButtonsContainer}>
          {availableColumns.length > 0 ? (
            availableColumns.map((column) => (
              <button key={column._id} onClick={() => handleMove(column._id)} className={styles.moveButton}>
                <span className={styles.buttonText}>{column.title}</span>

                <SvgIcon size={16} iconName={"icon-arrow-circle-broken"} className={styles.iconArrow} title="Move" />
              </button>
            ))
          ) : (
            <p className={styles.noColumnsText}>There is not another column</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MoveCardTool;
