// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import styles from '../styles/Dashboard.module.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Logo from './Logo';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const userRes = await fetch(`http://localhost:5000/api/users/${userId}`);
      const userData = await userRes.json();
      if (userData?.user) {
        setUser(userData.user);
        setBalance(userData.user.balance); // ✅ Use fixed balance from DB
      }

      const txRes = await fetch(`http://localhost:5000/api/users/${userId}/transactions`);
      const txData = await txRes.json();
      if (txData?.transactions) {
        setTransactions(txData.transactions);
        generateChart(txData.transactions);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const generateChart = (txs) => {
    const daily = {};
    txs.forEach((tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString();
      daily[date] = (daily[date] || 0) + tx.amount;
    });
    const formatted = Object.entries(daily).map(([date, amount]) => ({
      date,
      amount,
    }));
    setChartData(formatted);
  };

  const formatAmount = (amt) =>
    Number(amt).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <Logo />
        <nav className={styles.navMenu}>
          <Link to="/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link to="/transaction" className={styles.navItem}>Transactions</Link>
          <Link to="/beneficiaries" className={styles.navItem}>Beneficiaries</Link>
          <Link to="/settings" className={styles.navItem}>Settings</Link>
          <button onClick={handleLogout} className={styles.navItem}>Logout</button>
        </nav>
      </div>

      <div className={styles.mainContent}>
        <h1 className={styles.welcome}>Welcome, {user?.name || '...'}</h1>

        <div className={styles.card}>
          <strong>Account Balance:</strong>{' '}
          {loading ? 'Loading...' : formatAmount(balance)}
        </div>

        <div className={styles.card}>
          <h3>📊 Spending Analytics</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Bar dataKey="amount" fill="#e69ca0" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No spending data available yet.</p>
          )}
        </div>

        <div className={styles.card}>
          <h3>💸 Recent Transactions</h3>
          {transactions.length > 0 ? (
            <ul className={styles.transactionList}>
              {transactions.slice(0, 5).map((tx) => (
                <li key={tx._id} className={styles.transactionItem}>
                  <strong>To:</strong> {tx.recipient} |{' '}
                  <strong>Amount:</strong> ₹{tx.amount.toLocaleString()} |{' '}
                  <strong>Date:</strong>{' '}
                  {new Date(tx.createdAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
