import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import styles from './ResetPasswordPage.module.css';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setStatus({ type: 'error', message: 'Reset link is invalid or missing.' });
      return;
    }

    if (!password || password.length < 8) {
      setStatus({
        type: 'error',
        message: 'Password must be at least 8 characters.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match.',
      });
      return;
    }

    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          result?.message || 'Password could not be reset. Please try again.';
        setStatus({ type: 'error', message: errorMessage });
      } else {
        setStatus({
          type: 'success',
          message: 'Your password has been updated. Redirecting to the login screen...',
        });
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setStatus({
        type: 'error',
        message: 'Unable to reach the server. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Create a new password</h1>
        <p className={styles.subtitle}>
          Create a strong password to regain access to your account.
        </p>
        <input
          type="password"
          placeholder="New password"
          className={styles.input}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          className={styles.input}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update password'}
        </button>
        {status.message && (
          <div
            className={
              status.type === 'success' ? styles.successText : styles.errorText
            }
          >
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}

export default ResetPasswordPage;
