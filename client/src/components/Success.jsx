import React from 'react';
import styles from '../styles/TransactionFeedback.module.css';

const Success = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.success}>✅ Transaction Successful!</h1>
      <p className={styles.message}>Your payment has been securely completed using behavioral biometrics.</p>
      <button className={styles.button} onClick={() => window.location.href = '/dashboard'}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default Success;