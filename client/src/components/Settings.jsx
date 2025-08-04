import React, { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';

const Settings = () => {
  const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    pin: ''
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setForm({ ...form, name: data.user.name, email: data.user.email });
        }
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
    };
    if (form.password) payload.password = form.password;
    if (form.pin) payload.pin = form.pin;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      alert(result.message || 'Updated successfully');
    } catch (err) {
      alert('Error updating settings');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>⚙️ Settings</h2>

      <div className={styles.card}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Name</label>
          <input className={styles.input} name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} name="email" value={form.email} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <input className={styles.input} type="password" name="password" value={form.password} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label>
          <input className={styles.input} type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Transaction PIN</label>
          <input className={styles.input} name="pin" value={form.pin} onChange={handleChange} />
        </div>

        <button className={styles.button} onClick={handleUpdate}>💾 Save Changes</button>
      </div>
    </div>
  );
};

export default Settings;
