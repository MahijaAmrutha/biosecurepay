import React, { useEffect, useState } from 'react';

const LoginHistory = ({ userId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/logs/${userId}`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error('Failed to fetch logs:', err));
  }, [userId]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Login History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Device</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.device}</td>
              <td>{log.success ? '✅ Success' : '❌ Failed'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoginHistory;
