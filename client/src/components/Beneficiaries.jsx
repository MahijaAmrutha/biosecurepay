import React, { useEffect, useState } from 'react';
import styles from '../styles/Dashboard.module.css'; // Using same theme
import { v4 as uuidv4 } from 'uuid';

const Beneficiaries = () => {
  const userId = localStorage.getItem('userId');
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    ifsc: '',
  });

  // Fetch existing beneficiaries
  const fetchBeneficiaries = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/beneficiaries`);
      const data = await res.json();
      if (data?.beneficiaries) {
        setBeneficiaries(data.beneficiaries);
      }
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // Add new beneficiary
  const handleAdd = async () => {
    const { name, accountNumber, ifsc } = formData;
    if (!name || !accountNumber || !ifsc) {
      alert('Please fill all fields');
      return;
    }

    const newBeneficiary = {
      id: uuidv4(),
      name,
      accountNumber,
      ifsc,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBeneficiary),
      });

      if (res.ok) {
        setBeneficiaries([...beneficiaries, newBeneficiary]);
        setFormData({ name: '', accountNumber: '', ifsc: '' });
      }
    } catch (err) {
      console.error('Error adding beneficiary:', err);
    }
  };

  // Delete a beneficiary
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/beneficiaries/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
    }
  };

  return (
    <div className={styles.mainContent}>
      <h2 className={styles.welcome}>👥 Manage Beneficiaries</h2>

      <div className={styles.card}>
        <h3>Add New Beneficiary</h3>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Account Number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="IFSC Code"
            value={formData.ifsc}
            onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
            className={styles.input}
          />
          <button className={styles.button} onClick={handleAdd}>➕ Add</button>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Saved Beneficiaries</h3>
        {beneficiaries.length > 0 ? (
          <ul className={styles.transactionList}>
            {beneficiaries.map((b) => (
              <li key={b.id} className={styles.transactionItem}>
                <strong>{b.name}</strong> | A/C: {b.accountNumber} | IFSC: {b.ifsc}
                <button className={styles.logoutBtn} onClick={() => handleDelete(b.id)}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No beneficiaries added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Beneficiaries;
