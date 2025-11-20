// client/src/components/Header/Navbar.jsx

import React, { use } from 'react';
import styles from './Navbar.module.css';
import { useState } from 'react';
import { useEffect } from 'react';


function Navbar() {
    const [themeContent, setThemeContent] = useState(false);
    const [theme, setTheme] = useState('light');
    
    // dropdownunu aç/kapa 
    const toggleThemeContent = () => {
        setThemeContent(!themeContent);
    }
    // temayı değiştir
    const changeTheme=(selectedTheme) => {
        setTheme(selectedTheme);
        setThemeContent(false);//seçim yapıldıktan sonra dropdownu  kapat 
    }
    // Default temayı body'e uygula ve theme değişirse güncelle
    useEffect(() => {
    document.body.className = theme; 
    }, [theme]); // boş dependency array -> component ilk render olduğunda çalışır


    return (
        <div className={styles.taskPro}>
            <div className={styles.sidebar}>
       
                {/* Sol Taraf boş sidebar */}
            </div>
          <nav className={styles.navbarContainer}>
                <div className={styles.navbarMenu}>
                    {/* 1. Tema Seçim Bölümü */} 
                    <div  className={styles.themeSelector}>
                        <div className={styles.themeContent} onClick={toggleThemeContent}>
                            <p className={styles.themeTittle}>Theme</p>
                            <img
                                src="/theme-arrow-icon.svg" 
                                className={styles.themeArrowIcon}
                            />
                        </div>
                        {themeContent && (
                            <div className={styles.themeDropdown} >
                                <p className={styles.themeOption} onClick={() => changeTheme('light')} >Light</p>
                                <p className={styles.themeOption} onClick={() => changeTheme('dark')}>Dark</p>
                                <p className={styles.themeOption} onClick={() => changeTheme('violet')}>Violet</p>
                            </div>
                        )}
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