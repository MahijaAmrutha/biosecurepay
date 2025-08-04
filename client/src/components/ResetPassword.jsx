import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css'; // Reusing Register styles

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async () => {
    setError('');
    setSuccess('');

    if (!token) {
      return setError('Reset token is missing or invalid.');
    }

    if (!newPassword || newPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Password reset successfully ✅');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Reset failed ❌');
      }
    } catch (err) {
      console.error('Reset Error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Reset Your Password</h2>

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}

      <input
        type="password"
        placeholder="New Password"
        className={styles.input}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className={styles.input}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button className={styles.registerBtn} onClick={handleReset}>
        Reset Password
      </button>
    </div>
  );
};

export default ResetPassword;