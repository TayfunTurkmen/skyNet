import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { API_BASE_URL, AUTH_STORAGE_KEY } from '../../config';

function HomePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    let refreshToken = '';

    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        refreshToken = parsedAuth?.refreshToken || '';
      }
    } catch (error) {
      console.error('Failed to parse auth storage:', error);
    }

    const logoutPayload = refreshToken ? { refreshToken } : {};

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(logoutPayload),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      window.alert('Sunucuya ulaşılamadı. Yerel olarak çıkış yapılıyor.');
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsLoading(false);
      navigate('/welcome', { replace: true });
    }
  };

  return (
    <div className={styles.homePage}>
      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? 'Logging out...' : 'Log Out'}
      </button>
    </div>
  );
}

export default HomePage;
