import React, { useState, useEffect, useRef } from "react";
import SvgIcon from "./SvgIcon";
import styles from "./NewBoardModal.module.css";
import api from "../../utils/api";
import { CLOUDINARY_BASE_URL } from "../../config";

const ICONS = [
  "icon-project",
  "icon-star",
  "icon-loading",
  "icon-puzzle-piece",
  "icon-container",
  "icon-lightning",
  "icon-colors",
  "icon-hexagon",
];

const BACKGROUNDS = [
  "default",
  "1_nqhssv",
  "2_odvwrn",
  "3_kvsi9f",
  "4_jzp1gw",
  "5_qkap2h",
  "6_w9h9ad",
  "7_qyzh0g",
  "8_szx6nx",
  "9_q07czp",
  "10_pypmgt",
  "11_h0uyfq",
  "12_vdr3vp",
  "13_rafxr2",
  "14_jdiac7",
  "15_gueaym",
];

function NewBoardModal({ onClose, isEditMode = false, initialData = {}, onBoardCreated, onBoardUpdated }) {
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const cleanInitialBg = initialData?.background ? initialData.background.replace(".jpg", "") : BACKGROUNDS[0];
  const [selectedBg, setSelectedBg] = useState(cleanInitialBg);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || "");
      setSelectedIcon(initialData.icon || ICONS[0]);
      const bgVal = initialData?.background ? initialData.background.replace(".jpg", "") : BACKGROUNDS[0];
      setSelectedBg(bgVal);
    } else {
      setTitle("");
      setSelectedIcon(ICONS[0]);
      setSelectedBg(BACKGROUNDS[0]);
    }
  }, [isEditMode, initialData]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setError("");

    try {
      const res = await api.post("/boards/upload-bg", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedBg(res.data.bgId);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    const boardData = { title, icon: selectedIcon, background: selectedBg };

    try {
      if (isEditMode) {
        await onBoardUpdated?.({ ...initialData, ...boardData });
      } else {
        const created = await onBoardCreated?.(boardData);
        if (!created) {
          throw new Error("Board could not be created");
        }
      }

      onClose();
    } catch (err) {
      console.error("Board save error:", err);
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{isEditMode ? "Edit board" : "New board"}</h3>
        <button type="button" onClick={onClose} className={styles.closeButton}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1L17 17M17 1L1 17" />
          </svg>
        </button>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            autoFocus
          />

          <p className={styles.subTitle}>Icons</p>
          <div className={styles.iconGroup}>
            {ICONS.map((icon, i) => (
              <div
                key={i}
                className={`${styles.iconOption} ${selectedIcon === icon ? styles.selected : ""}`}
                onClick={() => setSelectedIcon(icon)}
              >
                <SvgIcon iconName={icon} size={18} />
              </div>
            ))}
          </div>

          <p className={styles.subTitle}>Background</p>
          <div className={styles.backgroundGrid}>
            <div
              className={styles.bgOption}
              style={{ backgroundColor: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => fileInputRef.current.click()}
            >
              {uploading ? (
                <span style={{ fontSize: "10px", color: "#888" }}>...</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {BACKGROUNDS.map((bgName, index) => (
              <div
                key={index}
                className={`${styles.bgOption} ${selectedBg === bgName ? styles.selected : ""}`}
                onClick={() => setSelectedBg(bgName)}
                style={{
                  backgroundColor: bgName === "default" ? "#2a2a2a" : "transparent",
                  backgroundImage:
                    bgName !== "default" ? `url(${CLOUDINARY_BASE_URL}/w_64,h_64,c_fill,q_auto/${bgName}.jpg)` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            ))}

            {selectedBg && !BACKGROUNDS.includes(selectedBg) && (
              <div
                className={`${styles.bgOption} ${styles.selected}`}
                style={{
                  backgroundImage: `url(${CLOUDINARY_BASE_URL}/w_64,h_64,c_fill,q_auto/${selectedBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            )}
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <button type="submit" className={styles.createButton} disabled={loading || uploading}>
            <div className={styles.btnIconBox}>+</div>
            {loading ? "Processing..." : isEditMode ? "Edit" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewBoardModal;
