import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import Logo from './Logo';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Logo is already styled inside Logo.jsx */}
      <Logo />

      
      <button onClick={() => navigate('/login')} className={styles.loginBtn}>
        Login
      </button>

      <button onClick={() => navigate('/register')} className={styles.registerBtn}>
        Register
      </button>
    </div>
  );
};

export default Home;
