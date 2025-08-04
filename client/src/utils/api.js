import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 🔄 Get user's transactions
export const fetchTransactions = (userId) =>
  API.get(`/transaction/${userId}`);
