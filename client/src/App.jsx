import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Transaction from './components/Transaction';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Beneficiaries from './components/Beneficiaries';
import Settings from './components/Settings';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transaction" element={<Transaction />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/beneficiaries" element={<Beneficiaries />} />
      <Route path="/settings" element={<Settings />} />

    </Routes>
  </Router>
);

export default App;
