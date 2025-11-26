import React, { useEffect, useMemo, useState } from "react";
import styles from "./ProfileModal.module.css";
import { API_BASE_URL, AUTH_STORAGE_KEY } from "../../config";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.user || parsed?.userInfo || parsed?.userData || parsed?.profile || null;
  } catch (e) {
    return null;
  }
};

const ProfileModal = ({ user, onClose }) => {
  const effectiveUser = user || getStoredUser();
  if (!effectiveUser) return null;

  const [formData, setFormData] = useState({
    name: effectiveUser?.name || "",
    email: effectiveUser?.email || "",
    password: "",
    photo: effectiveUser?.avatarURL || "/user-profile-icon.svg",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!effectiveUser) return;
    setFormData({
      name: effectiveUser.name || "",
      email: effectiveUser.email || "",
      password: "",
      photo: effectiveUser.avatarURL || "/user-profile-icon.svg",
    });
    setPhotoFile(null);
    setErrors({});
    setServerError("");
  }, [effectiveUser?.name, effectiveUser?.email, effectiveUser?.avatarURL]);

  // Fetch fresh profile from backend when modal opens
  useEffect(() => {
    const fetchProfile = async () => {
      const authData = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
      const token = authData?.token;
      if (!token) return;
      setLoadingProfile(true);
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user) {
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            photo: data.user.avatarURL || "/user-profile-icon.svg",
          }));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const avatarURL = useMemo(() => {
    if (photoFile) return URL.createObjectURL(photoFile);
    if (
      formData.photo &&
      formData.photo !== "/user-profile-icon.svg" &&
      formData.photo !== "user-profile-icon.svg"
    ) {
      const fileName = formData.photo.split("/").pop();
      const baseUrl = API_BASE_URL.replace("/api", "");
      return `${baseUrl}/uploads/${fileName}?t=${Date.now()}`;
    }
    return null;
  }, [photoFile, formData.photo]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email is invalid";
    if (formData.password && formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const authData = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "{}");
    const token = authData?.token;
    if (!token) {
      setServerError("You must be logged in to update profile.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);
    if (photoFile) data.append("avatar", photoFile);

    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        body: data,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setServerError(errData?.message || "Profile update failed");
        return;
      }

      const updatedUser = await res.json();
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          token: updatedUser.token,
          refreshToken: updatedUser.refreshToken,
          user: updatedUser.user,
        })
      );
      setPhotoFile(null);
      onClose(updatedUser.user);
    } catch (error) {
      console.error("Update failed:", error);
      setServerError("Server error, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Edit profile</h3>

        <div className={styles.avatarContainer}>
          {avatarURL ? (
            <img
              src={avatarURL}
              alt="profile"
              className={styles.avatarImg}
              onClick={() => document.getElementById("photoInput").click()}
            />
          ) : (
            <svg
              viewBox="0 0 32 32"
              className={styles.avatarIcon}
              onClick={() => document.getElementById("photoInput").click()}
            >
              <use href="/sprites.svg#icon-user" />
            </svg>
          )}
          <button
            type="button"
            className={styles.avatarUpload}
            onClick={() => document.getElementById("photoInput").click()}
            aria-label="Upload avatar"
          >
            +
          </button>
          <input type="file" id="photoInput" style={{ display: "none" }} onChange={handlePhotoChange} accept="image/*" />
        </div>

        <div className={styles.inputGroup}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>
        <div className={styles.inputGroup}>
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>
        <div className={styles.inputGroup}>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password (min 8 chars)"
          />
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>

        {serverError && <p className={styles.serverError}>{serverError}</p>}
        {loadingProfile && <p className={styles.serverError}>Loading profile...</p>}

        <div className={styles.buttonGroup}>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
