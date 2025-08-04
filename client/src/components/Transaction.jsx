import React, { useState, useEffect } from 'react';
import styles from '../styles/Transaction.module.css';
import {
  startKeystrokeCapture,
  getKeystrokeData
} from '../utils/keystrokeTracker';
import { startMouseTracking, getMouseData } from '../utils/mouseTracker';
import { startTouchTracking, getTouchData } from '../utils/touchTracker';
import { recordNavigation, getNavigationData, endLoginTimer } from '../utils/navigationTracker';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const Transaction = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    recordNavigation('Transaction');

    const cleanupKeys = !isMobile ? startKeystrokeCapture(document) : null;
    const cleanupMouse = !isMobile ? startMouseTracking(document) : null;
    const cleanupTouch = isMobile ? startTouchTracking(document) : null;

    const userId = localStorage.getItem('userId');

    fetch(`http://localhost:5000/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setBalance(data.user?.balance || 0);
      })
      .catch(err => console.error('Failed to load user:', err));

    return () => {
      cleanupKeys?.();
      cleanupMouse?.();
      cleanupTouch?.();
    };
  }, []);

  const handleTransaction = async () => {
    if (!pin || pin.length < 4) return alert('Please enter a valid 4-digit PIN');
    if (!recipientEmail || !amount) return alert('Please fill all fields');

    setLoading(true);

    const recipientRes = await fetch(`http://localhost:5000/api/users/by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: recipientEmail.trim().toLowerCase() })
    });

    const recipientData = await recipientRes.json();
    if (!recipientRes.ok || !recipientData.user) {
      setLoading(false);
      return alert('Recipient not found in BioSecurePay ❌');
    }

    const biometric = {
      keystrokes: getKeystrokeData(),
      mouse: getMouseData(),
      touches: getTouchData(),
      navigation: getNavigationData(),
      loginTime: endLoginTimer()
    };

    const payload = {
      userId: localStorage.getItem('userId'),
      recipientEmail,
      amount,
      biometric,
      pin
    };

    try {
      const response = await fetch('http://localhost:5000/api/transaction/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setBalance(data.newBalance); // ✅ Update balance
        alert(`${data.message} ✅\nUpdated Balance: ₹${data.newBalance}`);
        setAmount('');
        setPin('');
        setRecipientEmail('');
      } else {
        alert(data.message || 'Transaction failed ❌');
      }
    } catch (err) {
      alert('Server error ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Secure Transaction</h2>

      {user && (
        <div className={styles.userDetails}>
          <p><strong>User:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Balance:</strong> ₹{balance?.toLocaleString() || 'Loading...'}</p>
        </div>
      )}

      <input
        type="text"
        placeholder="Recipient Email"
        className={styles.input}
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="number"
        placeholder="Amount"
        className={styles.input}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Enter Security PIN"
        className={styles.input}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        disabled={loading}
      />

      <button className={styles.button} onClick={handleTransaction} disabled={loading}>
        {loading ? 'Verifying Biometrics...' : 'Send Securely'}
      </button>

      {loading && (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Analyzing behavioral patterns 🔐</p>
          
        </div>
      )}
    </div>
  );
};

export default Transaction;
