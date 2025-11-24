import React, { useState } from "react";
import * as yup from "yup";
import { Calendar } from "../Calendar/Calendar";
import styles from "./EditCardModal.module.css";
import { LABELS } from "../../../config";
import SvgIcon from "../../DashboardForm/SvgIcon";

const getTodayDateOnly = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const cardSchema = yup.object({
  title: yup.string().required("Title is required").trim(),
  description: yup.string().required("Description is required").trim(),
  priority: yup.string().oneOf(["Low", "Medium", "High", "Without"]).default("Without"),
  deadline: yup.date().nullable().min(getTodayDateOnly(), "You cannot select a past date"),
});

function EditCardModal({ isOpen, onClose, card, onSubmit }) {
  const initialState = {
    title: card?.title || "",
    description: card?.description || "",
    priority: card?.priority || "Without",
    deadline: card?.deadline ? new Date(card.deadline) : null,
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validatedData = await cardSchema.validate({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline,
      });

      onSubmit({
        ...card,
        title: validatedData.title.trim(),
        description: validatedData.description.trim(),
        priority: validatedData.priority,
        deadline: validatedData.deadline ? validatedData.deadline.toISOString() : null,
      });

      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Doğrulama Hatası:", error);
      if (error.path) setErrors({ [error.path]: error.message });
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.addCardModalOverlay}>
      <div className={styles.addCardModalContainer}>
        <SvgIcon
          iconName="icon-x-close"
          size={22}
          className={styles.closeButton}
          onClick={onClose}
          disabled={isSubmitting}
        />
        <h2 className={styles.addCardModalHeader}>Edit Card</h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className={styles.formGroup}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`${styles.addCardModalInput} ${errors.title ? styles.error : ""}`}
              placeholder="Title"
              disabled={isSubmitting}
            />
            {errors.title && <p className={styles.errorMessage}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${styles.addCardModalTextArea} ${errors.description ? styles.error : ""}`}
              placeholder="Description"
              disabled={isSubmitting}
            />
            {errors.description && <p className={styles.errorMessage}>{errors.description}</p>}
          </div>

          {/* Priority */}
          <div className={styles.formGroup}>
            <p className={styles.labelTitle}>Label Color</p>
            <div className={styles.labelContainer}>
              {LABELS.map((label) => (
                <label key={label.name} className={styles.labelOptions}>
                  <input
                    type="radio"
                    name="label"
                    value={label.name}
                    checked={formData.priority === label.name}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <span style={{ background: label.color }}></span>
                </label>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className={styles.formGroup}>
            <label className={styles.labelTitle}>Deadline</label>
            <Calendar
              deadline={formData.deadline}
              setDeadline={(date) => setFormData({ ...formData, deadline: date })}
            />
            {errors.deadline && <p className={styles.errorMessage}>{errors.deadline}</p>}
          </div>

          {/* Buttons */}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCardModal;
