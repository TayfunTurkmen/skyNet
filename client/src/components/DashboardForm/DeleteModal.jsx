import React from 'react';
import styles from './DeleteModal.module.css';

function DeleteModal({ isOpen, onClose, onConfirm, title = "Are you sure?" }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>
          This action cannot be undone. Are you sure you want to delete this board and all its cards?
        </p>
        
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
