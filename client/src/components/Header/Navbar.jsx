import React, { useEffect, useRef, useState } from "react";
import styles from "./Navbar.module.css";

function Navbar({ activeTheme = "light", onThemeChange, user }) {
  const [themeContent, setThemeContent] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleThemeContent = () => {
    setThemeContent((v) => !v);
  };

  const changeTheme = (selectedTheme) => {
    onThemeChange?.(selectedTheme);
    setThemeContent(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!themeContent) return;
      const insideDropdown = dropdownRef.current?.contains(e.target);
      const insideButton = buttonRef.current?.contains(e.target);
      if (!insideDropdown && !insideButton) {
        setThemeContent(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [themeContent]);

  return (
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

        <div className={styles.userProfile}>
          <span className={styles.userName}>{user?.name || "User"}</span>
          <div className={styles.userAvatar} title={user?.email || ""}>
            {user?.avatarURL ? (
              <img src={user.avatarURL} alt="avatar" />
            ) : (
              <span>{(user?.name || "U").charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
