import React from 'react';
import styles from '../styles/TransactionFeedback.module.css';

const Failure = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.failure}>❌ Transaction Failed</h1>
      <p className={styles.message}>Biometric or PIN mismatch. Please try again or contact support.</p>
      <button className={styles.button} onClick={() => window.location.href = '/transaction'}>
        Try Again
      </button>
    </div>
  );
};

export default Failure;