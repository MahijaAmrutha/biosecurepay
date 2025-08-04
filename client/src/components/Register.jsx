import React, { useState, useEffect } from 'react';
import styles from '../styles/Register.module.css';
import { startKeystrokeCapture, getKeystrokeData } from '../utils/keystrokeTracker';
import { startMouseTracking, getMouseData } from '../utils/mouseTracker';



const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');
  const [loginTimeStart] = useState(Date.now());

  useEffect(() => {
  const cleanupKeys = startKeystrokeCapture(document);
  const cleanupMouse = startMouseTracking();

  return () => {
    cleanupKeys();
    cleanupMouse();
  };
}, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!pin || pin.length < 4) return alert('PIN must be at least 4 digits');
    if (pin !== confirmPin) return alert("PINs don't match");

    const keystrokes = getKeystrokeData();
  const mouse = getMouseData();
    const loginTime = Date.now() - loginTimeStart;

    console.log('🧠 Keystroke data:', keystrokes);
    console.log('🖱️ Mouse data:', mouse);
    const payload = {
  name,
  email,
  password,
  pin,
  biometric: {
    keystrokes,
    mouse,
    touches: [],
    navigation: [],
    loginTime,
  },
};


    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Registration successful ✅');
        localStorage.setItem('userId', data.userId);
        window.location.href = '/dashboard';
      } else {
        setMessage(data.message || 'Registration failed ❌');
      }
    } catch (err) {
      console.error('Register error:', err);
      setMessage('Server error ❌');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src="/logo.png" alt="BioSecurePay Logo" className={styles.logo} />
        <h2 className={styles.title}>Create Your Account</h2>
      </div>

      <form className={styles.form} onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Full Name"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Set Security PIN"
          className={styles.input}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Security PIN"
          className={styles.input}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          required
        />
        <button className={styles.registerBtn} type="submit">Register</button>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Register;
