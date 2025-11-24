import React from 'react';
import styles from './DeleteModal.module.css';

function DeleteModal({ isOpen, onClose, onConfirm, title = "Are you sure?" }) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>
          Bu işlem geri alınamaz. Bu panoyu ve içindeki tüm kartları silmek istediğinize emin misiniz?
        </p>
        
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            İptal
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;