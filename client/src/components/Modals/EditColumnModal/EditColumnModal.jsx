import React, { useState } from "react";
import styles from "./EditColumnModal.module.css";
import SvgIcon from "../../DashboardForm/SvgIcon";

const EditColumnModal = ({ currentTitle, onSubmit, onClose }) => {
  const [newTitle, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);

  const handleSetTitle = (event) => {
    setTitle(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    await onSubmit(newTitle);
    setLoading(false);
    onClose();
  };

  return (
    <div className={styles.editModalWrapper} onClick={onClose}>
      <div className={styles.editModalContainer} onClick={(e) => e.stopPropagation()}>
        <SvgIcon iconName="icon-x-close" size={22} className={styles.closeButton} onClick={onClose} />
        <div className={styles.editModalTitle}>Edit Column</div>
        <form className={styles.editModalForm} onSubmit={handleSubmit}>
          <input className={styles.editModalFormInput} type="text" value={newTitle} onChange={handleSetTitle} />
          <button className={styles.editButton} type="submit">
            <span>+</span>
            {loading ? "Updating..." : "Edit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditColumnModal;
