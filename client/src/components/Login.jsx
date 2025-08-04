import React, { useEffect, useState } from 'react';
import styles from '../styles/Login.module.css';
import { useNavigate } from 'react-router-dom';
import { startKeystrokeCapture, getKeystrokeData } from '../utils/keystrokeTracker';
import { startMouseTracking, getMouseData } from '../utils/mouseTracker';
import { startTouchTracking, getTouchData } from '../utils/touchTracker';
import { recordNavigation, getNavigationData, endLoginTimer } from '../utils/navigationTracker';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    recordNavigation('Login');

    const cleanupKeys = !isMobile ? startKeystrokeCapture(document) : null;
    const cleanupMouse = !isMobile ? startMouseTracking(document) : null;
    const cleanupTouch = isMobile ? startTouchTracking(document) : null;

    return () => {
      cleanupKeys?.();
      cleanupMouse?.();
      cleanupTouch?.();
    };
  }, []);

  const handleLogin = async () => {
    const payload = {
      email: username,
      password,
      biometrics: {
        keystrokes: getKeystrokeData(),
        mouse: getMouseData(),
        touches: getTouchData(),
        navigation: getNavigationData(),
        loginTime: endLoginTimer()
      }
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userId', data.userId);
        alert('Login Successful ✅');
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed ❌');
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Try again.');
    }
  };

  return (
    <div className={styles.container}>
      <Logo />
      <h2 className={styles.title}>Log In</h2>
      <input
        type="text"
        placeholder="Username"
        className={styles.input}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className={styles.loginBtn} onClick={handleLogin}>Login</button>
      <p className={styles.forgotText}>
  <Link to="/forgot-password">Forgot Password?</Link>
</p>   

    </div>
  );
};

export default Login;
