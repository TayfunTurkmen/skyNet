// client/src/components/Header/Navbar.jsx

import React from 'react';
import styles from './Navbar.module.css';

function Navbar() {

    return (
        <div className={styles.taskPro}>
            <div className={styles.sidebar}>
                {/* Sol Taraf boş sidebar */}
            </div>
          <nav className={styles.navbarContainer}>
                <div className={styles.navbarMenu}>
                    {/* 1. Tema Seçim Bölümü */} 
                    <div className={styles.themeSelector}>
                        <span className={styles.themeLabel}>Theme</span>
                        <select className={styles.themeDropdown}>
                            <option value="light">light</option>
                            <option value="dark">dark</option>
                            <option value="violet">violet</option>
                        </select>
                    </div>
                
                    {/* 2. Kullanıcı Profili Bölümü */}
                    <div className={styles.userProfile}>
                        <span className={styles.userName}>User</span>
                        <img
                            src="/user-profile-icon.svg"
                            alt="User Avatar Icon"
                            className={styles.userAvatar} 
                        />
                    </div>
                </div>
            </nav>
            </div>
    ); 
}

export default Navbar;