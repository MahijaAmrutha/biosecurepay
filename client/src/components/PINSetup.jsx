// PINSetup.jsx
import React, { useState } from 'react';
import styles from '../styles/SetPin.module.css'; // use the dedicated theme-based CSS

const PINSetup = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');

  const userId = localStorage.getItem('userId');

  const handleSavePin = async () => {
    if (!pin || pin.length < 4) return alert('PIN must be at least 4 digits');
    if (pin !== confirmPin) return alert("PINs don't match");

    try {
      const res = await fetch('http://localhost:5000/api/users/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pin })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('PIN set successfully ✅');
      } else {
        setMessage(data.message || 'Failed to set PIN ❌');
      }
    } catch (err) {
      console.error('PIN setup error:', err);
      setMessage('Server error ❌');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Set Your Security PIN</h2>

      <input
        type="password"
        className={styles.input}
        placeholder="Enter 4-digit PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        maxLength={4}
      />
      <input
        type="password"
        className={styles.input}
        placeholder="Confirm PIN"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
        maxLength={4}
      />

      <button className={styles.button} onClick={handleSavePin}>
        Save PIN
      </button>

      {message && <p style={{ marginTop: '16px', color: '#b94e57' }}>{message}</p>}
    </div>
  );
};

export default PINSetup;
