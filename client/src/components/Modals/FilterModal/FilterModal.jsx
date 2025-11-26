import React from "react";
import styles from "./FilterModal.module.css";
import SvgIcon from "../../DashboardForm/SvgIcon";

const LABEL_OPTIONS = [
  { name: "Without priority", value: "Without", color: "#9ca3af" },
  { name: "Low", value: "Low", color: "#5c6bd1" },
  { name: "Medium", value: "Medium", color: "#e582a6" },
  { name: "High", value: "High", color: "#8dd59a" },
];

function FilterModal({ selectedFilter = null, onSelectFilter, onClose }) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Filters</h3>
          <button className={styles.closeButton} type="button" onClick={onClose}>
            <SvgIcon iconName="icon-x-close" size={20} />
          </button>
        </div>

        <hr className={styles.divider} />

        <div className={styles.row}>
          <p className={styles.labelTitle}>Label color</p>
          <button className={styles.showAll} type="button" onClick={() => onSelectFilter?.(null)}>
            Show all
          </button>
        </div>

        <div className={styles.options}>
          {LABEL_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.option}>
              <input
                type="radio"
                name="labelFilter"
                checked={selectedFilter === opt.value}
                onChange={() => onSelectFilter?.(opt.value)}
                style={{ "--dot-color": opt.color }}
              />
              <span className={styles.optionText}>{opt.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
