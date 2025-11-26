import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Navbar.module.css";
import ProfileModal from "./ProfileModal";
import SvgIcon from "../DashboardForm/SvgIcon";
import { API_BASE_URL, AUTH_STORAGE_KEY } from "../../config";

function Navbar({ activeTheme = "light", onThemeChange, user: initialUser }) {
  const [themeContent, setThemeContent] = useState(false);
  const [user, setUser] = useState(initialUser || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Local user fallback from storage
  useEffect(() => {
    if (initialUser) return;
    try {
      const authRaw = localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed = authRaw ? JSON.parse(authRaw) : null;
      const storedUser = parsed?.user || parsed?.userInfo || parsed?.userData || parsed?.profile;
      if (storedUser) setUser(storedUser);
    } catch (e) {
      setUser(null);
    }
  }, [initialUser]);

  const toggleThemeContent = () => {
    setThemeContent((v) => !v);
  };

  const changeTheme = (selectedTheme) => {
    if (selectedTheme !== activeTheme) {
      onThemeChange?.(selectedTheme);
    }
    setThemeContent(false);
  };

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!themeContent) return;
      const insideDropdown = dropdownRef.current?.contains(e.target);
      const insideButton = buttonRef.current?.contains(e.target);
      if (!insideDropdown && !insideButton) setThemeContent(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [themeContent]);

  const handleModalClose = (updatedUser) => {
    setIsModalOpen(false);
    if (updatedUser) setUser(updatedUser);
  };

  const avatarSrc = useMemo(() => {
    const avatarPath = user?.avatarURL;
    if (!avatarPath || avatarPath.length <= 1) return "/user-profile-icon.svg";
    const normalized = avatarPath.startsWith("/") ? avatarPath.substring(1) : avatarPath;
    const baseUrl = API_BASE_URL.replace("/api", "");
    return `${baseUrl}/${normalized}?t=${Date.now()}`;
  }, [user?.avatarURL]);

  return (
    <>
      <nav className={styles.navbarContainer}>
        <div className={styles.navbarMenu}>
          <div className={styles.themeSelector}>
            <button ref={buttonRef} className={styles.themeButton} onClick={toggleThemeContent} type="button">
              <span className={styles.themeLabel}>Theme</span>
              <span className={styles.themeValue}>{activeTheme}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {themeContent && (
              <div className={styles.themeDropdown} ref={dropdownRef}>
                {["light", "violet", "dark"].map((opt) => (
                  <button
                    key={opt}
                    className={`${styles.themeOption} ${activeTheme === opt ? styles.themeOptionActive : ""}`}
                    type="button"
                    onClick={() => changeTheme(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className={styles.userProfile} onClick={() => setIsModalOpen(true)} type="button">
            <span className={styles.userName}>{user?.name || "User"}</span>
            <div className={styles.userAvatar} title={user?.email || ""}>
              {avatarSrc ? <img src={avatarSrc} alt="avatar" /> : <SvgIcon iconName="icon-user" size={20} />}
            </div>
          </button>
        </div>
      </nav>

      {isModalOpen &&
        (user ? (
          <ProfileModal user={user} onClose={handleModalClose} />
        ) : (
          <div className={styles.loadingFallback}>Loading user...</div>
        ))}
    </>
  );
}

export default Navbar;
