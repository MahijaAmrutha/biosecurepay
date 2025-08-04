// ✅ ForgotPassword.jsx (frontend)
import React, { useState } from 'react';
import styles from '../styles/Login.module.css';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSendLink = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert('Error sending email. Check server.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Forgot Password</h2>
      <input
        className={styles.input}
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className={styles.loginBtn} onClick={handleSendLink}>
        Send Reset Link
      </button>
    </div>
  );
};

export default ForgotPassword;
