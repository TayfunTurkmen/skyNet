import React, { useState } from "react";
import * as yup from "yup";
import styles from "./AddColumnModal.module.css";
import SvgIcon from "../../DashboardForm/SvgIcon";

const columnSchema = yup.object({
  title: yup.string().required("Başlık gereklidir").trim(),
});

function AddColumnModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await columnSchema.validate({ title });
      onSubmit(title.trim());
      setTitle("");
    } catch (error) {
      if (error.path) {
        setErrors({ [error.path]: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.addColumnOverlay}>
      <div className={styles.addColumnModal}>
        <SvgIcon iconName="icon-x-close" size={22} className={styles.addColumnCloseBtn} onClick={onClose} />
        <h2 className={styles.addColumnTitle}>Add Column</h2>

        <form className={styles.addColumnForm} onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${styles.addColumnInput} ${errors.title ? styles.addColumnInputError : ""}`}
              placeholder="Title"
              disabled={isSubmitting}
            />
            {errors.title && <p className={styles.addColumnErrorText}>{errors.title}</p>}
          </div>

          <button type="submit" className={styles.addColumnSubmitBtn} disabled={isSubmitting}>
            <span>+</span>
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddColumnModal;
